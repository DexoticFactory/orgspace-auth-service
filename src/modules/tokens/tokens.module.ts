import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './domain/session.entity.js';
import { RefreshToken } from './domain/refresh-token.entity.js';
import { TokenService } from './application/token.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, RefreshToken]),
    JwtModule.register({}),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokensModule {}
