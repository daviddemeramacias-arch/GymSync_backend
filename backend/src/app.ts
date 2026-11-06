import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger.config';
import { logger } from '@shared/utils/logger';
import { AppError } from '@shared/utils/app-error';

// ── Rutas de módulos ──────────────────────────────────────────────
import { healthRouter } from '@modules/health/health.router';
import { authRouter } from '@modules/auth/auth.router';
import { membersRouter } from '@modules/members/member.router';
import { financeRouter } from '@modules/finance/finance.router';
import { marketplaceRouter } from '@modules/marketplace/marketplace.router';
import { accessRouter } from '@modules/access/access.router';
import { routinesRouter } from '@modules/routines/routines.router';
import { notificationsRouter } from '@modules/notifications/notifications.router';
import { metricsRouter } from '@modules/metrics/metrics.router';
// import { accessRouter }   from '@modules/access/access.router';
// import { financeRouter }  from '@modules/finance/finance.router';

export class AppFactory {
  static create(): Application {
    const app = express();

    AppFactory.applySecurityMiddlewares(app);
    AppFactory.applyCommonMiddlewares(app);
    AppFactory.applyRateLimiting(app);
    AppFactory.applyRoutes(app);
    AppFactory.applyErrorHandler(app);

    return app;
  }

  // ── Seguridad ────────────────────────────────────────────────────
  private static applySecurityMiddlewares(app: Application): void {
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    }));

    const allowedOrigins = [
      process.env.ADMIN_WEB_URL || 'http://localhost:4200',
      process.env.PWA_URL || 'http://localhost:4201',
    ];

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origen no permitido — ${origin}`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Gym-ID'],
      credentials: true,
    }));
  }

  // ── Middlewares comunes ──────────────────────────────────────────
  private static applyCommonMiddlewares(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: '15mb' }));
    app.use(express.urlencoded({ extended: true, limit: '15mb' }));

    // Logger de peticiones HTTP
    app.use(morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }));

    // Parsear X-Forwarded-For de proxies
    app.set('trust proxy', 1);
  }

  // ── Rate Limiting ────────────────────────────────────────────────
  private static applyRateLimiting(app: Application): void {
    // Global: 300 req / 15 min
    app.use('/api', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Demasiadas peticiones. Intenta en 15 minutos.' },
    }));

    // Auth: 10 intentos / 15 min (protección fuerza bruta)
    app.use('/api/auth', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { error: 'Demasiados intentos de autenticación. Intenta más tarde.' },
    }));
  }

  // ── Rutas ────────────────────────────────────────────────────────
  private static applyRoutes(app: Application): void {
    const API_PREFIX = '/api/v1';

    // Swagger UI
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { background-color: #4C5E51; }',
      customSiteTitle: 'GymSync API Docs',
      swaggerOptions: { persistAuthorization: true },
    }));

    // Swagger JSON spec
    app.get('/api/docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Health check
    app.use(`${API_PREFIX}/health`, healthRouter);

    // Auth (Módulo 1)
    app.use(`${API_PREFIX}/auth`, authRouter);
    app.use(`${API_PREFIX}/members`, membersRouter);
    app.use(`${API_PREFIX}/finance`, financeRouter);
    app.use(`${API_PREFIX}/marketplace`, marketplaceRouter);
    app.use(`${API_PREFIX}/access`, accessRouter);
    app.use(`${API_PREFIX}/routines`, routinesRouter);
    app.use(`${API_PREFIX}/notifications`, notificationsRouter);
    app.use(`${API_PREFIX}/metrics`, metricsRouter);

    // ── Módulos (se activan por fase) ──
    // app.use(`${API_PREFIX}/auth`,      authRouter);
    // app.use(`${API_PREFIX}/members`,   membersRouter);
    // app.use(`${API_PREFIX}/access`,    accessRouter);
    // app.use(`${API_PREFIX}/finance`,   financeRouter);
    // app.use(`${API_PREFIX}/marketplace`, marketplaceRouter);
    // app.use(`${API_PREFIX}/routines`,  routinesRouter);
    // app.use(`${API_PREFIX}/notifications`, notificationsRouter);

    // 404
    app.use((req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      });
    });
  }

  // ── Error Handler Global ─────────────────────────────────────────
  private static applyErrorHandler(app: Application): void {
    app.use((err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
      }

      logger.error('Error no controlado:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
      });

      return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    });
  }
}
