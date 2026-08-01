import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from '../../common/crypto/crypto.module.js';
import { PasswordCredential } from '../accounts/domain/password-credential.entity.js';
import { CredentialsService } from './application/credentials.service.js';

@Module({
  imports: [CryptoModule, TypeOrmModule.forFeature([PasswordCredential])],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
