import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';
import { Account } from './account.entity.js';

export type CredentialStatus = 'active' | 'expired' | 'revoked';

@Entity('password_credentials')
export class PasswordCredential {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar', name: 'account_id' })
  account_id!: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'text' })
  password_hash!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: CredentialStatus;

  @Column({ type: 'boolean', default: false })
  is_temporary!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  revoked_reason!: string | null;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
