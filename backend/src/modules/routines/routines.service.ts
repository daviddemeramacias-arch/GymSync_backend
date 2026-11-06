import { AppDataSource } from '@config/database.config';
export async function createRoutine(d:any){ await AppDataSource.query('INSERT INTO workout_routines (gym_id,name,description,duration_weeks,difficulty,is_active,created_by) VALUES (?,?,?,?,?,?,?)',[d.gym_id,d.name,d.description||null,d.duration_weeks||4,d.difficulty||'BEGINNER',true,d.created_by||null]); const rows=await AppDataSource.query('SELECT * FROM workout_routines WHERE gym_id=? AND name=? ORDER BY created_at DESC LIMIT 1',[d.gym_id,d.name]); return rows[0]; }
export async function listRoutines(gym_id:string){ return AppDataSource.query('SELECT * FROM workout_routines WHERE gym_id=? AND is_active=true',[gym_id]); }

const assignments: Record<string,string[]> = {};
export function assignRoutine(uid:string,rid:string){ assignments[uid]=assignments[uid]||[]; assignments[uid].push(rid); }
export function getAssignments(uid:string){ return assignments[uid]||[]; }

export async function addLog(d:any){ await AppDataSource.query('INSERT INTO workout_logs (user_id,gym_id,routine_id,exercise,sets,reps,weight) VALUES (?,?,?,?,?,?,?)',[d.user_id,d.gym_id,d.routine_id||null,d.exercise,d.sets||1,d.reps||1,d.weight||0]); const rows=await AppDataSource.query('SELECT * FROM workout_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 1',[d.user_id]); return rows[0]; }
export async function suggest(uid:string){ const rows=await AppDataSource.query('SELECT exercise, weight FROM workout_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 1',[uid]); if(!rows.length) return 'Registra tu primer ejercicio para recibir sugerencia.'; const {exercise,weight}=rows[0]; const next=(Number(weight)*1.05).toFixed(1); return `Próximo: incrementar carga 5% en ${exercise} a ${next} kg`; }
