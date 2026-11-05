import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36 })
  gym_id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', unsigned: true, default: 30 })
  duration_days!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price!: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'tinyint', unsigned: true, default: 3 })
  grace_days!: number;

  @Column({ default: false })
  is_daily!: boolean;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'char', length: 36 })
  user_id!: string;

  @Column({ type: 'char', length: 36 })
  plan_id!: string;

  @Column({ type: 'char', length: 36 })
  gym_id!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'EXPIRED', 'OVERDUE', 'FROZEN', 'CANCELLED'],
    default: 'ACTIVE',
  })
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  frozen_at!: Date | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  frozen_days!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
