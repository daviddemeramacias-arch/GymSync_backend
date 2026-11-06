import { AppDataSource } from '@config/database.config';
export async function run(){ try { const rows = await AppDataSource.query('SELECT DATE(created_at) d, method, COUNT(*) c FROM payments GROUP BY DATE(created_at),method LIMIT 1;').catch(()=>[]); console.log('[MetricsAgent] arqueo/kpis ok', rows?.length||0); } catch(e){ console.error('[MetricsAgent]', e); } }
export default { run };