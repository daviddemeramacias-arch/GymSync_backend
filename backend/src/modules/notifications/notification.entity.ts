import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36, nullable:true }) user_id!: string | null;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ type:'enum', enum:['WHATSAPP','EMAIL','PUSH'] }) channel!: string;
  @Column({ type:'enum', enum:['PIN_DELIVERY','PAYMENT_REMINDER','PAYMENT_CONFIRMED','OVERDUE_ALERT','CHURN_ALERT','PROMO','WEEKLY_REPORT','CUSTOM'] }) type!: string;
  @Column({ type:'text', nullable:true }) content!: string | null;
  @Column({ type:'enum', enum:['SENT','FAILED','PENDING'], default:'PENDING' }) status!: string;
  @Column({ type:'timestamp', nullable:true }) sent_at!: Date | null;
  @Column({ length:500, nullable:true }) error_msg!: string | null;
  @CreateDateColumn() created_at!: Date;
}