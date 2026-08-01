import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { authenticator } from 'otplib';
import { ulid } from '../../../common/database/ulid.js';
import { MfaFactor } from '../domain/mfa-factor.entity.js';
import { RecoveryCode } from '../domain/recovery-code.entity.js';

function sha256hex(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class MfaService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
  ) {}

  async setupTotp(
    accountId: string,
  ): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = authenticator.generateSecret();

    // Remove any existing pending factor before creating a new one
    await this.em.delete(MfaFactor, { account_id: accountId, status: 'pending' });

    const factor = this.em.create(MfaFactor, {
      id: ulid(),
      account_id: accountId,
      type: 'totp',
      secret,
      status: 'pending',
      verified_at: null,
    });
    await this.em.save(MfaFactor, factor);

    const otpauthUrl = authenticator.keyuri(accountId, 'OrgSpace', secret);
    return { secret, otpauthUrl };
  }

  async confirmTotp(
    accountId: string,
    code: string,
  ): Promise<{ recoveryCodes: string[] }> {
    const factor = await this.em.findOne(MfaFactor, {
      where: { account_id: accountId, status: 'pending' },
    });
    if (!factor) throw new NotFoundException('No pending TOTP setup found');

    const valid = authenticator.verify({ token: code, secret: factor.secret });
    if (!valid) throw new BadRequestException('Invalid TOTP code');

    factor.status = 'active';
    factor.verified_at = new Date();
    await this.em.save(MfaFactor, factor);

    // Delete old recovery codes, then issue fresh set
    await this.em.delete(RecoveryCode, { account_id: accountId });

    const rawCodes: string[] = [];
    const entities: RecoveryCode[] = [];
    for (let i = 0; i < 8; i++) {
      const raw = randomBytes(8).toString('hex');
      rawCodes.push(raw);
      entities.push(
        this.em.create(RecoveryCode, {
          id: ulid(),
          account_id: accountId,
          code_hash: sha256hex(raw),
          used: false,
          used_at: null,
        }),
      );
    }
    await this.em.save(RecoveryCode, entities);

    return { recoveryCodes: rawCodes };
  }

  async verifyTotp(accountId: string, code: string): Promise<boolean> {
    const factor = await this.em.findOne(MfaFactor, {
      where: { account_id: accountId, status: 'active' },
    });
    if (!factor) return false;

    // Try TOTP first
    if (authenticator.verify({ token: code, secret: factor.secret })) {
      return true;
    }

    // Fall back to recovery code (constant-time compare)
    const candidateHash = Buffer.from(sha256hex(code), 'utf8');
    const unused = await this.em.find(RecoveryCode, {
      where: { account_id: accountId, used: false },
    });

    for (const rc of unused) {
      const storedHash = Buffer.from(rc.code_hash, 'utf8');
      if (
        candidateHash.length === storedHash.length &&
        timingSafeEqual(candidateHash, storedHash)
      ) {
        rc.used = true;
        rc.used_at = new Date();
        await this.em.save(RecoveryCode, rc);
        return true;
      }
    }

    return false;
  }

  async disableTotp(accountId: string): Promise<void> {
    await this.em.update(
      MfaFactor,
      { account_id: accountId },
      { status: 'disabled' },
    );
    await this.em.delete(RecoveryCode, { account_id: accountId });
  }
}
