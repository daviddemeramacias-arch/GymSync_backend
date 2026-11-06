import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('workout_routines')
export class WorkoutRoutine {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ length:150 }) name!: string;
  @Column({ type:'text', nullable:true }) description!: string | null;
  @Column({ type:'tinyint', unsigned:true, default:4 }) duration_weeks!: number;
  @Column({ type:'enum', enum:['BEGINNER','INTERMEDIATE','ADVANCED'], default:'BEGINNER' }) difficulty!: string;
  @Column({ default:true }) is_active!: boolean;
  @Column({ type:'char',length:36, nullable:true }) created_by!: string | null;
  @CreateDateColumn() created_at!: Date;
}

@Entity('workout_logs')
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type:'char',length:36 }) user_id!: string;
  @Column({ type:'char',length:36 }) gym_id!: string;
  @Column({ type:'char',length:36, nullable:true }) routine_id!: string | null;
  @Column({ length:150 }) exercise!: string;
  @Column({ type:'int', unsigned:true, default:1 }) sets!: number;
  @Column({ type:'int', unsigned:true, default:1 }) reps!: number;
  @Column({ type:'decimal', precision:6, scale:2, default:0 }) weight!: number;
  @CreateDateColumn() created_at!: Date;
}