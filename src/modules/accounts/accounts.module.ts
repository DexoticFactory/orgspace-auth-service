import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './domain/account.entity.js';
import { LoginIdentifier } from './domain/login-identifier.entity.js';
import { PasswordCredential } from './domain/password-credential.entity.js';
import { AccountsService } from './application/accounts.service.js';
import { AccountsController } from './transport/accounts.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Account, LoginIdentifier, PasswordCredential])],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
