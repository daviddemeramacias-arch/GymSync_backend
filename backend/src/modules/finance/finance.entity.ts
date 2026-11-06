import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ length:100 }) bank_name!: string;
  @Column({ type:'enum', enum:['SAVINGS','CHECKING'], default:'SAVINGS' }) account_type!: string;
  @Column({ length:30 }) account_number!: string;
  @Column({ length:150 }) account_holder!: string;
  @Column({ length:20, nullable:true }) id_number!: string | null;
  @Column({ length:500, nullable:true }) qr_image_url!: string | null;
  @Column({ default:true }) is_active!: boolean;
  @CreateDateColumn() created_at!: Date;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36 }) user_id!: string;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ type:'char',length:36, nullable:true }) membership_id!: string | null;
  @Column({ type:'char',length:36, nullable:true }) plan_id!: string | null;
  @Column({ type:'decimal',precision:8,scale:2 }) amount!: number;
  @Column({ type:'char',length:3,default:'USD' }) currency!: string;
  @Column({ type:'enum', enum:['CASH','TRANSFER','CARD'], default:'TRANSFER' }) method!: string;
  @Column({ type:'enum', enum:['PENDING','IN_REVIEW','APPROVED','REJECTED'], default:'PENDING' }) status!: string;
  @Column({ length:500, nullable:true }) receipt_url!: string | null;
  @Column({ type:'json', nullable:true }) ocr_data!: any;
  @Column({ length:100, nullable:true }) bank_reference!: string | null;
  @Column({ type:'char',length:36, nullable:true }) bank_account_id!: string | null;
  @Column({ type:'char',length:36, nullable:true }) approved_by!: string | null;
  @Column({ type:'timestamp', nullable:true }) approved_at!: Date | null;
  @Column({ type:'text', nullable:true }) rejected_reason!: string | null;
  @Column({ default:false }) auto_validated!: boolean;
  @Column({ type:'text', nullable:true }) notes!: string | null;
  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}
PY