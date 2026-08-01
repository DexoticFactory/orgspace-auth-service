import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationChallenge } from './domain/verification-challenge.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationChallenge])],
  exports: [TypeOrmModule],
})
export class VerificationModule {}
