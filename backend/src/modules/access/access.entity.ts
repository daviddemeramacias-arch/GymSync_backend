import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('access_logs')
export class AccessLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36, nullable:true }) user_id!: string | null;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ type:'enum', enum:['QR','PIN','BIOMETRIC','MANUAL'] }) method!: string;
  @Column({ type:'enum', enum:['GRANTED','DENIED'] }) result!: string;
  @Column({ length:200, nullable:true }) denied_reason!: string | null;
  @Column({ type:'char',length:36, nullable:true }) token_id!: string | null;
  @Column({ length:100, nullable:true }) device_id!: string | null;
  @Column({ default:false }) offline_sync!: boolean;
  @Column({ type:'timestamp', nullable:true }) synced_at!: Date | null;
  @CreateDateColumn() created_at!: Date;
}