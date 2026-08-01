import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaFactor } from './domain/mfa-factor.entity.js';
import { RecoveryCode } from './domain/recovery-code.entity.js';
import { MfaService } from './application/mfa.service.js';
import { MfaController } from './transport/mfa.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([MfaFactor, RecoveryCode])],
  providers: [MfaService],
  controllers: [MfaController],
  exports: [MfaService],
})
export class MfaModule {}
