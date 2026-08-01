import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InternalApiGuard } from '../../accounts/guards/internal-api.guard';
import { UpsertTenantAccessDto } from '../application/upsert-tenant-access.dto';
import { TenantAccessService } from '../application/tenant-access.service';

@Controller('internal/tenant-access')
@UseGuards(InternalApiGuard)
export class TenantAccessController {
  constructor(private readonly service: TenantAccessService) {}

  @Post()
  @HttpCode(204)
  upsert(@Body() dto: UpsertTenantAccessDto): Promise<void> {
    return this.service.upsert(dto);
  }

  @Get(':accountId')
  getTenants(@Param('accountId') accountId: string) {
    return this.service.getTenantsForAccount(accountId);
  }

  @Delete(':accountId/:tenantId')
  @HttpCode(204)
  revoke(
    @Param('accountId') accountId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<void> {
    return this.service.revokeForAccount(accountId, tenantId);
  }
}
