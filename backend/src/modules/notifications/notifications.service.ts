import { AppDataSource } from '@config/database.config';
import { TEMPLATES, render, sendWhatsApp } from './whatsapp.service';
export async function sendNotification(d:any){
  const content = d.template ? render(TEMPLATES[d.template]||d.content||'', d.vars||{}) : (d.content||'');
  await AppDataSource.query('INSERT INTO notification_logs (user_id,gym_id,channel,type,content,status) VALUES (?,?,?,?,?,?)',[d.user_id||null,d.gym_id,d.channel||'WHATSAPP',d.type||'CUSTOM',content,'PENDING']);
  const res = await sendWhatsApp(d.phone||'', content, 3);
  await AppDataSource.query('UPDATE notification_logs SET status=?, sent_at=NOW() WHERE gym_id=? AND channel=? ORDER BY created_at DESC LIMIT 1',[res.status,d.gym_id,d.channel||'WHATSAPP']);
  const rows=await AppDataSource.query('SELECT * FROM notification_logs WHERE gym_id=? ORDER BY created_at DESC LIMIT 1',[d.gym_id]);
  return { ...rows[0], attempts: res.attempts };
}
export async function listNotifications(gym_id:string){ return AppDataSource.query('SELECT * FROM notification_logs WHERE gym_id=? ORDER BY created_at DESC',[gym_id]); }
