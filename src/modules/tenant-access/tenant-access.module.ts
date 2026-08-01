import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantAccessProjection } from './domain/tenant-access-projection.entity';
import { TenantAccessService } from './application/tenant-access.service';
import { TenantAccessController } from './transport/tenant-access.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TenantAccessProjection])],
  providers: [TenantAccessService],
  controllers: [TenantAccessController],
  exports: [TenantAccessService],
})
export class TenantAccessModule {}
