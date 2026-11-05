import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { loginWithPin, createPinForUser, findUserById } from './auth.service';
import { AppError } from '@shared/utils/app-error';

export const loginValidation = [
  body('phone').isString().notEmpty(),
  body('pin').isString().isLength({ min: 4, max: 4 }),
];

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, pin } = req.body;
    const { token, user } = await loginWithPin(phone, pin);
    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role_id: user.role_id,
        gym_id: user.gym_id,
        pin_temp: user.pin_temp,
        status: user.status,
      },
    });
  } catch (e) {
    next(e);
  }
}

export const generatePinValidation = [
  body('user_id').isString().notEmpty(),
];

export async function generatePin(req: Request, res: Response, next: NextFunction) {
  try {
    const { user_id } = req.body;
    const { pin, user } = await createPinForUser(user_id);
    res.json({
      status: 'success',
      pin,
      user_id: user.id,
      message: 'PIN generado. Entregar por WhatsApp al socio.',
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req: any, res: Response, next: NextFunction) {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    res.json({ status: 'success', user });
  } catch (e) {
    next(e);
  }
}
