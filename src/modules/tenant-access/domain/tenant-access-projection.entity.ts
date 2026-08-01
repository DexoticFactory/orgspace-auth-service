import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid';

@Entity('tenant_access_projections')
@Index(['account_id', 'tenant_id'], { unique: true })
export class TenantAccessProjection {
  @PrimaryColumn({ type: 'varchar' })
  id: string = ulid();

  @Column({ type: 'varchar' })
  account_id: string;

  @Column({ type: 'varchar' })
  tenant_id: string;

  @Column({ type: 'text', array: true })
  roles: string[];

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'revoked';

  @Column({ type: 'integer' })
  version: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
