import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';

export type RefreshTokenStatus = 'active' | 'rotated' | 'revoked';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  session_id!: string;

  @Column({ type: 'varchar' })
  account_id!: string;

  @Column({ type: 'varchar' })
  token_hash!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: RefreshTokenStatus;

  /** Same ULID for all rotations within a session — used for reuse detection revocation */
  @Column({ type: 'varchar' })
  family_id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  rotated_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_at!: Date | null;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
