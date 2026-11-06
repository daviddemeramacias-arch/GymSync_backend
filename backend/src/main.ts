import 'reflect-metadata';
import 'dotenv/config';
import { AppFactory } from './app';
import { DatabaseService } from '@config/database.config';
import { logger } from '@shared/utils/logger';
import { startAgents } from '@agents/index';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function bootstrap(): Promise<void> {
  try {
    // 1. Conectar base de datos
    await DatabaseService.initialize();
    logger.info('✅ Base de datos conectada correctamente');

    // 2. Crear aplicación Express
    const app = AppFactory.create();
    startAgents();

    // 3. Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 GymSync API corriendo en puerto ${PORT}`);
      logger.info(`📄 Swagger docs: http://localhost:${PORT}/api/docs`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // 4. Manejo de cierre graceful
    process.on('SIGTERM', async () => {
      logger.info('⚠️  SIGTERM recibido. Cerrando servidor...');
      await DatabaseService.destroy();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('⚠️  SIGINT recibido. Cerrando servidor...');
      await DatabaseService.destroy();
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Error al iniciar GymSync API:', error);
    process.exit(1);
  }
}

bootstrap();
