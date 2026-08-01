import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsService } from '../../accounts/application/accounts.service.js';
import { CredentialsService } from '../../credentials/application/credentials.service.js';
import { TokenService } from '../../tokens/application/token.service.js';
import { Account } from '../../accounts/domain/account.entity.js';
import { LoginDto } from './login.dto.js';

type IdentifierType = 'email' | 'phone' | 'global_username' | 'tenant_username';

const INACCESSIBLE_STATUSES = new Set([
  'locked',
  'suspended',
  'disabled',
  'deleted',
]);

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly accounts: AccountsService,
    private readonly credentials: CredentialsService,
    private readonly tokens: TokenService,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async login(
    dto: LoginDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    requiresTenantSelection?: boolean;
    tenants?: string[];
  }> {
    const normalized = dto.identifier.toLowerCase().trim();
    const identifierType: IdentifierType =
      dto.identifier_type ??
      (normalized.includes('@') ? 'email' : 'global_username');

    const loginId = await this.accounts.findByIdentifier(
      identifierType,
      normalized,
      dto.tenant_id,
    );

    // Always use the same generic error to prevent account enumeration
    const GENERIC_BLOCKED = new UnauthorizedException('account_not_accessible');
    const GENERIC_CREDS = new UnauthorizedException('invalid_credentials');

    if (!loginId) throw GENERIC_CREDS;

    const account = await this.accounts.findById(loginId.account_id);
    if (!account) throw GENERIC_CREDS;

    if (INACCESSIBLE_STATUSES.has(account.status)) throw GENERIC_BLOCKED;
    if (account.locked_until && account.locked_until > new Date())
      throw GENERIC_BLOCKED;

    const { valid } = await this.credentials.verifyPassword(
      account.id,
      dto.password,
    );

    if (!valid) {
      // Informational counter — no lockout logic here (separate policy concern)
      await this.accountRepo.increment(
        { id: account.id },
        'failed_login_count',
        1,
      );
      throw GENERIC_CREDS;
    }

    // Successful auth — reset failure counter and stamp last_login_at
    await this.accountRepo.update(account.id, {
      failed_login_count: 0,
      last_login_at: new Date(),
    });

    const session = await this.tokens.createSession(
      account.id,
      dto.tenant_id,
      meta,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.tokens.signAccessToken({
        accountId: account.id,
        sessionId: session.id,
        tenantId: dto.tenant_id,
      }),
      this.tokens.issueRefreshToken(session.id, account.id),
    ]);

    return { accessToken, refreshToken, sessionId: session.id };
  }

  async refresh(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } =
      await this.tokens.rotateRefreshToken(rawRefreshToken);
    return { accessToken, refreshToken };
  }

  async logout(sessionId: string): Promise<void> {
    await this.tokens.revokeSession(sessionId);
  }

  async logoutAll(accountId: string): Promise<void> {
    await this.tokens.revokeAllSessions(accountId);
  }
}
