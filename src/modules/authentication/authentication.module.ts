import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module.js';
import { CredentialsModule } from '../credentials/credentials.module.js';
import { TokensModule } from '../tokens/tokens.module.js';
import { Account } from '../accounts/domain/account.entity.js';
import { AuthenticationService } from './application/authentication.service.js';
import { AuthController } from './transport/auth.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    AccountsModule,
    CredentialsModule,
    TokensModule,
  ],
  controllers: [AuthController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
