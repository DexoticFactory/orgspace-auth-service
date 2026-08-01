import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { RecoveryService } from '../application/recovery.service.js';

class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}

class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  new_password!: string;
}

class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

@Controller('auth')
export class RecoveryController {
  constructor(private readonly recovery: RecoveryService) {}

  /** No enumeration — always 202 regardless of whether account exists */
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.recovery.requestPasswordReset(dto.identifier);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.recovery.resetPassword(dto.token, dto.new_password);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.recovery.verifyEmail(dto.token);
  }
}
