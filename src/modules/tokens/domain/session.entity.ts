import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';

export type SessionStatus = 'active' | 'revoked';

@Entity('sessions')
export class Session {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  account_id!: string;

  @Column({ type: 'varchar', nullable: true })
  tenant_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_agent!: string | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address!: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status!: SessionStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;

  @Column({ type: 'timestamptz' })
  absolute_expires_at!: Date;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
