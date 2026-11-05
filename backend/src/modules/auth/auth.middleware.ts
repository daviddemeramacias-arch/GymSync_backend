import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/app-error';
import { verifyToken, AuthPayload } from './auth.service';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export async function authGuard(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Token no proporcionado', 401);
    req.user = await verifyToken(token);
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRoles(...roles: number[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('No autenticado', 401));
    if (!roles.includes(req.user.role_id)) {
      return next(new AppError('No tienes permisos para esta acción', 403));
    }
    next();
  };
}
