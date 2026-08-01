import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';
import { Account } from './account.entity.js';

export type IdentifierType =
  | 'email'
  | 'phone'
  | 'global_username'
  | 'tenant_username';

// Partial unique indexes enforced at DB level (deleted_at IS NULL)
@Index('uq_identifier_type_value', ['type', 'normalized_value'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('uq_identifier_tenant_type_value', ['tenant_id', 'type', 'normalized_value'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Entity('login_identifiers')
export class LoginIdentifier {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar', name: 'account_id' })
  account_id!: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ type: 'varchar', nullable: true })
  tenant_id!: string | null;

  @Column({ type: 'varchar' })
  type!: IdentifierType;

  @Column({ type: 'varchar' })
  normalized_value!: string;

  @Column({ type: 'varchar' })
  display_value!: string;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verified_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
