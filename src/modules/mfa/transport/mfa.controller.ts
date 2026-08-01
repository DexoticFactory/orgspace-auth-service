import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { MfaService } from '../application/mfa.service.js';

class SetupDto {
  account_id!: string;
}

class ConfirmDto {
  account_id!: string;
  code!: string;
}

class VerifyDto {
  account_id!: string;
  code!: string;
}

@Controller('auth/mfa')
export class MfaController {
  constructor(private readonly mfa: MfaService) {}

  @Post('setup')
  setup(@Body() dto: SetupDto) {
    return this.mfa.setupTotp(dto.account_id);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmDto) {
    return this.mfa.confirmTotp(dto.account_id, dto.code);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: VerifyDto) {
    return this.mfa.verifyTotp(dto.account_id, dto.code);
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  disable(@Param('accountId') accountId: string) {
    return this.mfa.disableTotp(accountId);
  }
}
