import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsIn(['email', 'phone', 'global_username'])
  identifier_type!: 'email' | 'phone' | 'global_username';

  @IsString()
  @MinLength(1)
  identifier_value!: string;

  @IsOptional()
  @IsString()
  tenant_id?: string;

  @IsOptional()
  @IsBoolean()
  is_temporary_credential?: boolean;
}
