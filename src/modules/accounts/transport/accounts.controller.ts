import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from '../application/accounts.service.js';
import { CreateAccountDto } from '../application/create-account.dto.js';
import { SetStatusDto } from '../application/set-status.dto.js';
import { InternalApiGuard } from '../guards/internal-api.guard.js';

@UseGuards(InternalApiGuard)
@Controller('internal/accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAccountDto): Promise<{ id: string }> {
    const id = await this.accounts.createAccount(dto);
    return { id };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.accounts.findById(id);
  }

  @Patch(':id/status')
  @HttpCode(204)
  async setStatus(
    @Param('id') id: string,
    @Body() dto: SetStatusDto,
  ): Promise<void> {
    await this.accounts.setAccountStatus(id, dto.status);
  }
}
