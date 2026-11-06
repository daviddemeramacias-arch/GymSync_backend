import { AppDataSource } from '@config/database.config';
export async function run(){ try { console.log('[AccessAgent] engine listo'); } catch(e){ console.error('[AccessAgent]', e); } }
export default { run };