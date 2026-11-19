import { AppDataSource } from '@config/database.config';
import { DEFAULT_GYM_ID } from '@shared/utils/gym';

export async function run() {
  try {
    const rows = await AppDataSource.query("SELECT u.id,u.first_name,u.phone,m.end_date FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.status='ACTIVE' AND m.end_date <= DATE_ADD(CURDATE(),INTERVAL 3 DAY)");
    console.log('[FinanceAgent] membresias a vencer (<=3d):', rows.length);
    for (const r of rows) {
      await AppDataSource.query("INSERT INTO notification_logs (user_id,gym_id,channel,type,content,status) VALUES (?,?, 'WHATSAPP','PAYMENT_REMINDER',?, 'SENT')",[r.id, DEFAULT_GYM_ID, 'Recuerda renovar tu membresía.']);
    }
  } catch (e) { console.error('[FinanceAgent]', e); }
}
export default { run };
