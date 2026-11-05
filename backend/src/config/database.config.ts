import { DataSource, DataSourceOptions } from 'typeorm';
import { logger } from '@shared/utils/logger';
import path from 'path';

const dbOptions: any = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'gymsync_user',
  password: process.env.DB_PASSWORD || 'gymsync_pass_2024',
  database: process.env.DB_NAME || 'gymsync_db',
  charset: 'utf8mb4',
  timezone: process.env.GYM_TIMEZONE || 'America/Guayaquil',

  // Entidades — se irán cargando por módulo
  entities: [
    path.join(__dirname, '../modules/**/*.entity.ts'),
    path.join(__dirname, '../modules/**/*.entity.js'),
  ],

  // Migraciones
  migrations: [
    path.join(__dirname, '../database/migrations/*.ts'),
    path.join(__dirname, '../database/migrations/*.js'),
  ],

  synchronize: false, // NUNCA true en producción
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  migrationsRun: false,

  // Pool de conexiones
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },
};

export const AppDataSource = new DataSource(dbOptions);

export class DatabaseService {
  static async initialize(): Promise<void> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info(`📦 Conectado a MySQL: ${dbOptions.host}:${dbOptions.port}/${dbOptions.database}`);
    }
  }

  static async destroy(): Promise<void> {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('🔌 Conexión MySQL cerrada');
    }
  }

  static getDataSource(): DataSource {
    if (!AppDataSource.isInitialized) {
      throw new Error('La base de datos no ha sido inicializada. Llama a DatabaseService.initialize() primero.');
    }
    return AppDataSource;
  }
}

// Exportación para CLI de TypeORM
export default AppDataSource;
