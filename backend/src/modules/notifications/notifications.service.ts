import { AppDataSource } from '@config/database.config';
export async function sendNotification(d:any){
  await AppDataSource.query('INSERT INTO notification_logs (user_id,gym_id,channel,type,content,status) VALUES (?,?,?,?,?,?)',[d.user_id||null,d.gym_id,d.channel,d.type,d.content,'PENDING']);
  await AppDataSource.query("UPDATE notification_logs SET status='SENT', sent_at=NOW() WHERE gym_id=? AND channel=? ORDER BY created_at DESC LIMIT 1",[d.gym_id,d.channel]);
  const rows=await AppDataSource.query('SELECT * FROM notification_logs WHERE gym_id=? ORDER BY created_at DESC LIMIT 1',[d.gym_id]);
  return rows[0];
}
export async function listNotifications(gym_id:string){ return AppDataSource.query('SELECT * FROM notification_logs WHERE gym_id=? ORDER BY created_at DESC',[gym_id]); }
PY