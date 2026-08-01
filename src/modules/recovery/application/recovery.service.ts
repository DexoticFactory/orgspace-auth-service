import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, IsNull } from 'typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { ulid } from '../../../common/database/ulid.js';
import { VerificationChallenge } from '../../verification/domain/verification-challenge.entity.js';
import { CredentialsService } from '../../credentials/application/credentials.service.js';
import { AccountsService } from '../../accounts/application/accounts.service.js';
import { LoginIdentifier } from '../../accounts/domain/login-identifier.entity.js';

function sha256hex(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function tokenMatches(raw: string, storedHash: string): boolean {
  const a = Buffer.from(sha256hex(raw), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

@Injectable()
export class RecoveryService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly credentials: CredentialsService,
    private readonly accounts: AccountsService,
  ) {}

  async requestPasswordReset(identifier: string): Promise<{ token: string }> {
    // No enumeration — resolve account best-effort, return same shape regardless
    const normalized = identifier.toLowerCase().trim();

    // Try email first, then phone, then global_username
    let row: LoginIdentifier | null = null;
    for (const type of ['email', 'phone', 'global_username'] as const) {
      row = await this.accounts.findByIdentifier(type, normalized);
      if (row) break;
    }

    const raw = randomBytes(32).toString('hex');

    if (row) {
      const challenge = this.em.create(VerificationChallenge, {
        id: ulid(),
        account_id: row.account_id,
        type: 'password_reset',
        token_hash: sha256hex(raw),
        status: 'pending',
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used_at: null,
      });
      await this.em.save(challenge);
    }

    // Always return a token — caller discards it if account was not found
    return { token: raw };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.credentials.enforcePolicy(newPassword);

    await this.em.transaction(async (tx) => {
      const pending = await tx.find(VerificationChallenge, {
        where: { type: 'password_reset', status: 'pending' },
      });

      const now = new Date();
      const challenge = pending.find(
        (c) => c.expires_at > now && tokenMatches(token, c.token_hash),
      );

      if (!challenge) {
        throw new UnauthorizedException('invalid_reset_token');
      }

      // Mark used before setting password (fail-safe ordering)
      challenge.status = 'used';
      challenge.used_at = now;
      await tx.save(challenge);

      await this.credentials.setPassword(challenge.account_id, newPassword);
    });
  }

  async requestEmailVerification(
    accountId: string,
    email: string,
  ): Promise<{ token: string }> {
    const raw = randomBytes(32).toString('hex');

    // ponytail: email param stored for audit — not persisted here; caller owns delivery
    void email;

    const challenge = this.em.create(VerificationChallenge, {
      id: ulid(),
      account_id: accountId,
      type: 'email_verification',
      token_hash: sha256hex(raw),
      status: 'pending',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used_at: null,
    });
    await this.em.save(challenge);

    return { token: raw };
  }

  async verifyEmail(token: string): Promise<void> {
    await this.em.transaction(async (tx) => {
      const pending = await tx.find(VerificationChallenge, {
        where: { type: 'email_verification', status: 'pending' },
      });

      const now = new Date();
      const challenge = pending.find(
        (c) => c.expires_at > now && tokenMatches(token, c.token_hash),
      );

      if (!challenge) {
        throw new UnauthorizedException('invalid_verification_token');
      }

      // Mark identifier as verified
      await tx.update(
        LoginIdentifier,
        { account_id: challenge.account_id, deleted_at: IsNull() },
        { is_verified: true, verified_at: now },
      );

      challenge.status = 'used';
      challenge.used_at = now;
      await tx.save(challenge);
    });
  }
}
