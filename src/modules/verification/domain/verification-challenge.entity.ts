import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from '../../../common/database/ulid.js';

export type ChallengeType = 'email_verification' | 'password_reset';
export type ChallengeStatus = 'pending' | 'used' | 'expired';

@Entity('verification_challenges')
export class VerificationChallenge {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  account_id!: string;

  @Column({ type: 'varchar' })
  type!: ChallengeType;

  @Column({ type: 'varchar' })
  token_hash!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: ChallengeStatus;

  @Column({ type: 'timestamptz' })
  expires_at!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  used_at!: Date | null;

  @BeforeInsert()
  setId(): void {
    if (!this.id) this.id = ulid();
  }
}
