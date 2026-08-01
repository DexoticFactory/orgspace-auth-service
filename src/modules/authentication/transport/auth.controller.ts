import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { InternalApiGuard } from '../../accounts/guards/internal-api.guard.js';
import { LoginDto } from '../application/login.dto.js';
import { AuthenticationService } from '../application/authentication.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthenticationService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { refresh_token: string }) {
    return this.auth.refresh(body.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() body: { session_id: string }) {
    return this.auth.logout(body.session_id);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(InternalApiGuard)
  logoutAll(@Body() body: { account_id: string }) {
    return this.auth.logoutAll(body.account_id);
  }
}
