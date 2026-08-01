import { IsIn } from 'class-validator';
import type { AccountStatus } from '../domain/account.entity.js';

export class SetStatusDto {
  @IsIn(['pending_activation', 'active', 'locked', 'suspended', 'disabled', 'deleted'])
  status!: AccountStatus;
}
