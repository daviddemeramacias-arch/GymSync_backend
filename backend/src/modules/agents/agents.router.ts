import { Router } from 'express';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import * as Finance from '../agents/finance.agent';
import * as Access from '../agents/access.agent';
import * as Churn from '../agents/churn.agent';
import * as Metrics from '../agents/metrics.agent';
import * as Marketing from '../agents/marketing.agent';
import * as Coach from '../agents/ai-coach.agent';

const router = Router();
router.post('/run', authGuard, requireRoles(1), async (req, res) => {
  const results = {};
  for (const [name,a] of Object.entries({Finance,Access,Churn,Metrics,Marketing,Coach})) {
    try { await (a as any).run(); results[name]='ok'; } catch(e){ results[name]=String(e); }
  }
  res.json({ status:'success', results });
});
export {router as agentsRouter};
export default router;