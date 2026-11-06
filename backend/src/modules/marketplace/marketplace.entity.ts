import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ length:150 }) name!: string;
  @Column({ type:'text', nullable:true }) description!: string | null;
  @Column({ type:'enum', enum:['SUPPLEMENT','CLOTHING','ACCESSORY','OTHER'], default:'SUPPLEMENT' }) category!: string;
  @Column({ type:'decimal',precision:8,scale:2 }) price!: number;
  @Column({ type:'int', unsigned:true, default:0 }) stock!: number;
  @Column({ type:'int', unsigned:true, default:5 }) min_stock!: number;
  @Column({ length:500, nullable:true }) image_url!: string | null;
  @Column({ default:true }) is_active!: boolean;
  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
}

@Entity('access_tokens')
export class AccessToken {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36 }) user_id!: string;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ type:'enum', enum:['DAILY_PASS','PICKUP','MONTHLY_PASS'] }) token_type!: string;
  @Column({ type:'char',length:4 }) code_4digit!: string;
  @Column({ type:'text' }) qr_payload!: string;
  @Column({ default:false }) used!: boolean;
  @Column({ type:'timestamp', nullable:true }) used_at!: Date | null;
  @Column({ type:'timestamp' }) expires_at!: Date;
  @CreateDateColumn() created_at!: Date;
}
PY