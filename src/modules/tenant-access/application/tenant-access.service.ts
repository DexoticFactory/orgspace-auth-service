import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantAccessProjection } from '../domain/tenant-access-projection.entity';
import { UpsertTenantAccessDto } from './upsert-tenant-access.dto';
import { ulid } from '../../../common/database/ulid';

@Injectable()
export class TenantAccessService {
  constructor(
    @InjectRepository(TenantAccessProjection)
    private readonly repo: Repository<TenantAccessProjection>,
  ) {}

  async upsert(dto: UpsertTenantAccessDto): Promise<void> {
    const existing = await this.repo.findOne({
      where: { account_id: dto.account_id, tenant_id: dto.tenant_id },
    });

    // Silently reject stale events
    if (existing && dto.version <= existing.version) return;

    await this.repo.save({
      id: existing?.id ?? ulid(),
      account_id: dto.account_id,
      tenant_id: dto.tenant_id,
      roles: dto.roles,
      status: dto.status,
      version: dto.version,
    });
  }

  async getTenantsForAccount(
    accountId: string,
  ): Promise<Pick<TenantAccessProjection, 'tenant_id' | 'roles'>[]> {
    return this.repo.find({
      where: { account_id: accountId, status: 'active' },
      select: { tenant_id: true, roles: true },
    });
  }

  async revokeForAccount(accountId: string, tenantId: string): Promise<void> {
    await this.repo.update(
      { account_id: accountId, tenant_id: tenantId },
      { status: 'revoked' },
    );
  }
}
