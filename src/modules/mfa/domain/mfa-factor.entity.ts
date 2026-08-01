import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';

export type MfaFactorStatus = 'pending' | 'active' | 'disabled';

@Entity('mfa_factors')
export class MfaFactor {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  account_id!: string;

  @Column({ type: 'varchar', default: 'totp' })
  type!: string;

  // ponytail: encrypt at rest — wrap with KMS/AES-256-GCM before storing; decrypt on read
  @Column({ type: 'varchar' })
  secret!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: MfaFactorStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  verified_at!: Date | null;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
