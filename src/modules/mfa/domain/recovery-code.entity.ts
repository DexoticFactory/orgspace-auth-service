import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';

@Entity('mfa_recovery_codes')
export class RecoveryCode {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  account_id!: string;

  @Column({ type: 'varchar' })
  code_hash!: string;

  @Column({ type: 'boolean', default: false })
  used!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  used_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
