import { AppDataSource } from '@config/database.config';
export async function kpis(gym_id:string){
  const [u] = await AppDataSource.query('SELECT COUNT(*) c FROM users WHERE gym_id=?',[gym_id]);
  const [m] = await AppDataSource.query("SELECT COUNT(*) c FROM memberships WHERE gym_id=? AND status='ACTIVE'",[gym_id]);
  const [p] = await AppDataSource.query("SELECT COALESCE(SUM(amount),0) s FROM payments WHERE gym_id=? AND status='APPROVED' AND MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE())",[gym_id]);
  const [pe] = await AppDataSource.query("SELECT COUNT(*) c FROM payments WHERE gym_id=? AND status='PENDING'",[gym_id]);
  return { users: u.c, active_memberships: m.c, revenue_month: p.s, pending_payments: pe.c };
}
export async function arqueo(gym_id:string, date:string){
  const d = date || new Date().toISOString().slice(0,10);
  const rows = await AppDataSource.query("SELECT method, COUNT(*) c, COALESCE(SUM(amount),0) s FROM payments WHERE gym_id=? AND status='APPROVED' AND DATE(created_at)=? GROUP BY method",[gym_id,d]);
  let cash=0, transfer=0;
  for(const r of rows){ if(r.method==='CASH') cash=r.s; else transfer += Number(r.s); }
  return { date:d, cash, transfer, total: Number(cash)+transfer, detail: rows };
}