import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '@config/database.config';
import { User } from './auth.entity';
import { AppError } from '@shared/utils/app-error';
import { logger } from '@shared/utils/logger';

export interface AuthPayload {
  sub: string;
  gym_id: string;
  role_id: number;
  phone: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no configurado');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

function userRepo(): Repository<User> {
  return AppDataSource.getRepository(User);
}

export async function generatePin(): Promise<string> {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function createPinForUser(userId: string): Promise<{ pin: string; user: User }> {
  const repo = userRepo();
  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new AppError('Usuario no encontrado', 404);
  const pin = await generatePin();
  user.pin_hash = await hashPin(pin);
  user.pin_temp = true;
  await repo.save(user);
  logger.info(`PIN generado para usuario ${userId}`);
  return { pin, user };
}

export async function loginWithPin(phone: string, pin: string): Promise<{ token: string; user: User }> {
  const repo = userRepo();
  const user = await repo.findOne({ where: { phone } });
  if (!user || !user.pin_hash) throw new AppError('Credenciales inválidas', 401);

  if (user.locked_until && new Date() < user.locked_until) {
    throw new AppError('Cuenta bloqueada. Intenta más tarde.', 423);
  }

  const ok = await bcrypt.compare(pin, user.pin_hash);
  if (!ok) {
    user.login_attempts = (user.login_attempts || 0) + 1;
    if (user.login_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      user.login_attempts = 0;
    }
    await repo.save(user);
    throw new AppError('Credenciales inválidas', 401);
  }

  user.login_attempts = 0;
  user.locked_until = null;
  user.last_login_at = new Date();
  if (user.status === 'INACTIVE') user.status = 'ACTIVE';
  await repo.save(user);

  const payload: AuthPayload = {
    sub: user.id,
    gym_id: user.gym_id,
    role_id: user.role_id,
    phone: user.phone,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  return { token, user };
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    throw new AppError('Token inválido o expirado', 401);
  }
}

export async function findUserById(id: string): Promise<User | null> {
  return userRepo().findOneBy({ id });
}
