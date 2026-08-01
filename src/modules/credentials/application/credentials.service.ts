import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Argon2Service } from '../../../common/crypto/argon2.service.js';
import { PasswordCredential } from '../../accounts/domain/password-credential.entity.js';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly argon2: Argon2Service,
  ) {}

  enforcePolicy(plain: string): void {
    if (plain.length < 8) {
      throw new BadRequestException('password_policy_violation');
    }
  }

  async setPassword(
    accountId: string,
    plain: string,
    opts?: { isTemporary?: boolean; expiresAt?: Date },
  ): Promise<void> {
    this.enforcePolicy(plain);
    const hash = await this.argon2.hash(plain);

    await this.em.transaction(async (tx) => {
      await tx
        .createQueryBuilder()
        .update(PasswordCredential)
        .set({
          status: 'revoked',
          revoked_at: new Date(),
          revoked_reason: 'superseded',
        })
        .where('account_id = :accountId AND status = :status', {
          accountId,
          status: 'active',
        })
        .execute();

      const cred = tx.create(PasswordCredential, {
        account_id: accountId,
        password_hash: hash,
        status: 'active',
        is_temporary: opts?.isTemporary ?? false,
        expires_at: opts?.expiresAt ?? null,
        revoked_at: null,
        revoked_reason: null,
      });
      await tx.save(cred);
    });
  }

  async verifyPassword(
    accountId: string,
    plain: string,
  ): Promise<{ valid: boolean; needsRehash: boolean; isTemporary: boolean }> {
    const cred = await this.em.findOne(PasswordCredential, {
      where: { account_id: accountId, status: 'active' },
    });

    if (!cred) {
      return { valid: false, needsRehash: false, isTemporary: false };
    }

    const valid = await this.argon2.verify(cred.password_hash, plain);
    const needsRehash = valid
      ? await this.argon2.needsRehash(cred.password_hash)
      : false;

    return { valid, needsRehash, isTemporary: cred.is_temporary };
  }
}
