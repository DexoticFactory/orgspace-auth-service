import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module.js';
import { CredentialsModule } from '../credentials/credentials.module.js';
import { VerificationModule } from '../verification/verification.module.js';
import { RecoveryService } from './application/recovery.service.js';
import { RecoveryController } from './transport/recovery.controller.js';

@Module({
  imports: [VerificationModule, AccountsModule, CredentialsModule],
  providers: [RecoveryService],
  controllers: [RecoveryController],
})
export class RecoveryModule {}
