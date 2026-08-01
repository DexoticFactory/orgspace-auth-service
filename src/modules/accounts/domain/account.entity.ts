import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';

export type AccountStatus =
  | 'pending_activation'
  | 'active'
  | 'locked'
  | 'suspended'
  | 'disabled'
  | 'deleted';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar', default: 'pending_activation' })
  status!: AccountStatus;

  @Column({ type: 'boolean', default: false })
  password_change_required!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until!: Date | null;

  @Column({ type: 'integer', default: 0 })
  failed_login_count!: number;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at!: Date | null;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
