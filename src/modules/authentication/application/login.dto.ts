import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsString()
  tenant_id?: string;

  @IsOptional()
  @IsIn(['email', 'phone', 'global_username', 'tenant_username'])
  identifier_type?: 'email' | 'phone' | 'global_username' | 'tenant_username';
}
