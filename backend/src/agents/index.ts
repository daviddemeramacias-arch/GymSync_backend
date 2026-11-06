import cron from 'node-cron';
import FinanceAgent from './finance.agent';
import AccessAgent from './access.agent';
import ChurnAgent from './churn.agent';
import MetricsAgent from './metrics.agent';
import MarketingAgent from './marketing.agent';
import AICoachAgent from './ai-coach.agent';

export function startAgents() {
  // Diario 08:00
  cron.schedule('0 8 * * *', () => { FinanceAgent.run(); ChurnAgent.run(); });
  // Cada hora
  cron.schedule('0 * * * *', () => { AccessAgent.run(); });
  // Diario 23:59
  cron.schedule('59 23 * * *', () => { MetricsAgent.run(); });
  // Lunes 08:30
  cron.schedule('30 8 * * 1', () => { MarketingAgent.run(); AICoachAgent.run(); });
  console.log('[Agents] schedulers registrados');
}
export default { startAgents };