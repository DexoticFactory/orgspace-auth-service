import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createHash,
  generateKeyPairSync,
  randomBytes,
} from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ulid } from '../../../common/database/ulid.js';
import { Session } from '../domain/session.entity.js';
import { RefreshToken } from '../domain/refresh-token.entity.js';

interface AccessTokenPayload {
  accountId: string;
  sessionId: string;
  tenantId?: string;
  roles?: string[];
  azv?: string;
}

@Injectable()
export class TokenService implements OnModuleInit {
  private privateKey!: string;
  private publicKey!: string;

  constructor(
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
    @InjectRepository(Session)
    private readonly sessions: Repository<Session>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
  ) {}

  onModuleInit(): void {
    this.generateKeyPair();
  }

  // ── Key management ────────────────────────────────────────────────────────

  generateKeyPair(): void {
    const privPath = join(
      process.cwd(),
      this.cfg.get<string>('JWT_PRIVATE_KEY_PATH') ?? './keys/private.pem',
    );
    const pubPath = join(
      process.cwd(),
      this.cfg.get<string>('JWT_PUBLIC_KEY_PATH') ?? './keys/public.pem',
    );

    if (!existsSync(privPath)) {
      mkdirSync(join(privPath, '..'), { recursive: true });
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      writeFileSync(privPath, privateKey as string, { mode: 0o600 });
      writeFileSync(pubPath, publicKey as string, { mode: 0o644 });
    }

    this.privateKey = readFileSync(privPath, 'utf-8');
    this.publicKey = readFileSync(pubPath, 'utf-8');
  }

  // ── Access token ──────────────────────────────────────────────────────────

  async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    const ttl = this.cfg.get<number>('JWT_ACCESS_TTL_SEC') ?? 600;
    return this.jwt.signAsync(
      {
        sub: payload.accountId,
        sid: payload.sessionId,
        tid: payload.tenantId ?? undefined,
        roles: payload.roles ?? [],
        azv: payload.azv ?? undefined,
        typ: 'access',
      },
      {
        algorithm: 'RS256',
        privateKey: this.privateKey,
        expiresIn: ttl,
        issuer: 'orgspace-auth',
        audience: 'orgspace-api',
        keyid: 'key-1',
      },
    );
  }

  // ── Refresh token ─────────────────────────────────────────────────────────

  async issueRefreshToken(
    sessionId: string,
    accountId: string,
    familyId?: string,
  ): Promise<string> {
    const idleTtl =
      this.cfg.get<number>('JWT_REFRESH_IDLE_TTL_SEC') ?? 604_800;
    const tokenId = ulid();
    const secret = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(secret).digest('hex');

    const rt = this.refreshTokens.create({
      id: tokenId,
      session_id: sessionId,
      account_id: accountId,
      token_hash: hash,
      status: 'active',
      family_id: familyId ?? ulid(),
      expires_at: new Date(Date.now() + idleTtl * 1000),
      rotated_at: null,
      revoked_at: null,
    });
    await this.refreshTokens.save(rt);

    return `${tokenId}.${secret}`;
  }

  async rotateRefreshToken(rawToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    session: Session;
  }> {
    const dot = rawToken.indexOf('.');
    if (dot === -1) throw new UnauthorizedException('invalid_refresh_token');

    const tokenId = rawToken.slice(0, dot);
    const secret = rawToken.slice(dot + 1);

    const rt = await this.refreshTokens.findOne({ where: { id: tokenId } });
    if (!rt) throw new UnauthorizedException('invalid_refresh_token');

    // Reuse detection: already rotated or revoked → revoke entire family
    if (rt.status !== 'active') {
      await this.refreshTokens.update(
        { family_id: rt.family_id },
        { status: 'revoked', revoked_at: new Date() },
      );
      throw new UnauthorizedException('refresh_token_reuse');
    }

    const expectedHash = createHash('sha256').update(secret).digest('hex');
    if (rt.token_hash !== expectedHash)
      throw new UnauthorizedException('invalid_refresh_token');

    if (rt.expires_at < new Date())
      throw new UnauthorizedException('refresh_token_expired');

    const session = await this.sessions.findOne({
      where: { id: rt.session_id },
    });
    if (!session || session.status !== 'active')
      throw new UnauthorizedException('session_invalid');

    if (session.absolute_expires_at < new Date())
      throw new UnauthorizedException('session_expired');

    // Atomically rotate: mark old, issue new
    await this.refreshTokens.update(rt.id, {
      status: 'rotated',
      rotated_at: new Date(),
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken({
        accountId: rt.account_id,
        sessionId: rt.session_id,
        tenantId: session.tenant_id ?? undefined,
      }),
      this.issueRefreshToken(rt.session_id, rt.account_id, rt.family_id),
    ]);

    return { accessToken, refreshToken, session };
  }

  // ── Session management ────────────────────────────────────────────────────

  async createSession(
    accountId: string,
    tenantId?: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<Session> {
    const absoluteTtl =
      this.cfg.get<number>('JWT_REFRESH_ABSOLUTE_TTL_SEC') ?? 2_592_000;

    const session = this.sessions.create({
      account_id: accountId,
      tenant_id: tenantId ?? null,
      user_agent: meta?.userAgent ?? null,
      ip_address: meta?.ipAddress ?? null,
      status: 'active',
      revoked_at: null,
      absolute_expires_at: new Date(Date.now() + absoluteTtl * 1000),
    });
    return this.sessions.save(session);
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessions.update(sessionId, {
      status: 'revoked',
      revoked_at: new Date(),
    });
    await this.refreshTokens.update(
      { session_id: sessionId, status: 'active' },
      { status: 'revoked', revoked_at: new Date() },
    );
  }

  async revokeAllSessions(accountId: string): Promise<void> {
    await this.sessions.update(
      { account_id: accountId, status: 'active' },
      { status: 'revoked', revoked_at: new Date() },
    );
    await this.refreshTokens.update(
      { account_id: accountId, status: 'active' },
      { status: 'revoked', revoked_at: new Date() },
    );
  }

  async listSessions(accountId: string): Promise<Session[]> {
    return this.sessions.find({
      where: { account_id: accountId, status: 'active' },
      order: { created_at: 'DESC' },
    });
  }
}
