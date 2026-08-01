import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Account, AccountStatus } from '../domain/account.entity.js';
import { IdentifierType, LoginIdentifier } from '../domain/login-identifier.entity.js';
import { CreateAccountDto } from './create-account.dto.js';
import { ulid } from '../../../common/database/ulid.js';

function normalizeIdentifier(type: IdentifierType | 'email' | 'phone' | 'global_username', value: string): string {
  switch (type) {
    case 'email':        return value.toLowerCase().trim();
    case 'phone':        return value.trim();
    case 'global_username':
    case 'tenant_username': return value.toLowerCase().trim();
  }
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectRepository(LoginIdentifier)
    private readonly identifierRepo: Repository<LoginIdentifier>,
  ) {}

  async createAccount(dto: CreateAccountDto): Promise<string> {
    const normalized = normalizeIdentifier(dto.identifier_type, dto.identifier_value);

    // Pre-check for conflict outside transaction to give a clean error
    const existing = await this.identifierRepo.findOne({
      where: {
        type: dto.identifier_type,
        normalized_value: normalized,
        deleted_at: IsNull(),
      },
    });
    if (existing) {
      throw new ConflictException(
        `Identifier ${dto.identifier_type}:${normalized} already exists`,
      );
    }

    return this.em.transaction(async (txm) => {
      const account = txm.create(Account, {
        id: ulid(),
        status: 'pending_activation',
        password_change_required: dto.is_temporary_credential ?? false,
      });
      await txm.save(account);

      const identifier = txm.create(LoginIdentifier, {
        id: ulid(),
        account_id: account.id,
        tenant_id: dto.tenant_id ?? null,
        type: dto.identifier_type,
        normalized_value: normalized,
        display_value: dto.identifier_value.trim(),
        is_primary: true,
        is_verified: false,
      });
      await txm.save(identifier);

      return account.id;
    });
  }

  async findByIdentifier(
    type: IdentifierType,
    normalizedValue: string,
    tenantId?: string,
  ): Promise<LoginIdentifier | null> {
    return this.identifierRepo.findOne({
      where: {
        type,
        normalized_value: normalizedValue,
        ...(tenantId !== undefined ? { tenant_id: tenantId } : {}),
        deleted_at: IsNull(),
      },
      relations: { account: true },
    });
  }

  async setAccountStatus(accountId: string, status: AccountStatus): Promise<void> {
    const result = await this.accountRepo.update({ id: accountId }, { status });
    if (result.affected === 0) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }
  }

  async findById(accountId: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException(`Account ${accountId} not found`);
    return account;
  }
}
