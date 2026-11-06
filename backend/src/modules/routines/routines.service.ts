import { AppDataSource } from '@config/database.config';

export async function createRoutine(d:any){ await AppDataSource.query('INSERT INTO workout_routines (gym_id,name,description,duration_weeks,difficulty,is_active,created_by) VALUES (?,?,?,?,?,?,?)',[d.gym_id,d.name,d.description||null,d.duration_weeks||4,d.difficulty||'BEGINNER',true,d.created_by||null]); const rows=await AppDataSource.query('SELECT * FROM workout_routines WHERE gym_id=? AND name=? ORDER BY created_at DESC LIMIT 1',[d.gym_id,d.name]); return rows[0]; }
export async function listRoutines(gym_id:string){ return AppDataSource.query('SELECT * FROM workout_routines WHERE gym_id=? AND is_active=true',[gym_id]); }

const assignments: Record<string,string[]> = {};
const logs:any[]=[];
export function assignRoutine(uid:string,rid:string){ assignments[uid]=assignments[uid]||[]; assignments[uid].push(rid); }
export function getAssignments(uid:string){ return assignments[uid]||[]; }
export function addLog(l:any){ logs.push({...l,created_at:new Date()}); return logs[logs.length-1]; }
export function suggest(uid:string){ const last=logs.filter(l=>l.user_id===uid).slice(-1)[0]; return 'Próximo: incrementar carga 5-10% en '+(last?.exercise||'ejercicio'); }
PY