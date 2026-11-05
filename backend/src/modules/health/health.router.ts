import { Router, Request, Response } from 'express';
import { AppDataSource } from '@config/database.config';
import { Redis } from 'ioredis';

export const healthRouter = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Estado del servidor y servicios
 *     security: []
 *     responses:
 *       200:
 *         description: Todos los servicios operativos
 *       503:
 *         description: Uno o más servicios caídos
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();

  const checks = {
    api: { status: 'ok', message: 'GymSync API operativa' },
    database: { status: 'unknown', message: '' },
    redis: { status: 'unknown', message: '' },
  };

  // Verificar MySQL
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.query('SELECT 1');
      checks.database = { status: 'ok', message: 'MySQL conectado' };
    } else {
      checks.database = { status: 'degraded', message: 'MySQL no inicializado' };
    }
  } catch (err) {
    checks.database = { status: 'error', message: 'MySQL no disponible' };
  }

  // Verificar Redis
  try {
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || 'gymsync_redis_2024',
      lazyConnect: true,
    });
    await client.connect();
    await client.ping();
    client.disconnect();
    checks.redis = { status: 'ok', message: 'Redis conectado' };
  } catch {
    checks.redis = { status: 'degraded', message: 'Redis no disponible (modo degradado)' };
  }

  const hasErrors = Object.values(checks).some((c) => c.status === 'error');
  const statusCode = hasErrors ? 503 : 200;
  const responseTime = Date.now() - startTime;

  return res.status(statusCode).json({
    status: hasErrors ? 'degraded' : 'ok',
    app: 'GymSync API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    responseTime: `${responseTime}ms`,
    checks,
  });
});
