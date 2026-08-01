import { IsArray, IsIn, IsNumber, IsString } from 'class-validator';

export class UpsertTenantAccessDto {
  @IsString()
  account_id: string;

  @IsString()
  tenant_id: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsIn(['active', 'revoked'])
  status: 'active' | 'revoked';

  @IsNumber()
  version: number;
}
