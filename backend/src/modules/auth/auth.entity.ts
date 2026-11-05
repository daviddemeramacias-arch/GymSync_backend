import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36 })
  gym_id!: string;

  @Column({ type: 'int', unsigned: true })
  role_id!: number;

  @Column({ length: 80 })
  first_name!: string;

  @Column({ length: 80 })
  last_name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ default: false })
  phone_verified!: boolean;

  @Column({ length: 150, nullable: true })
  email!: string | null;

  @Column({ length: 255, nullable: true })
  pin_hash!: string | null;

  @Column({ default: true })
  pin_temp!: boolean;

  @Column({ type: 'json', nullable: true })
  webauthn_credential!: any;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'OVERDUE', 'FROZEN', 'CANCELLED'],
    default: 'INACTIVE',
  })
  status!: string;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  login_attempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
