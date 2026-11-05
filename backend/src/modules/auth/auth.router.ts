import { Router } from 'express';
import { validationResult } from 'express-validator';
import { login, loginValidation, generatePin, generatePinValidation, me } from './auth.controller';
import { authGuard, requireRoles } from './auth.middleware';
import { AppError } from '@shared/utils/app-error';

const router = Router();

function validate(req: any, _res: any, next: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array().map((e: any) => e.msg).join(', '), 400));
  }
  next();
}

router.post('/login-pin', loginValidation, validate, login);
router.post('/generate-pin', authGuard, requireRoles(1, 2), generatePinValidation, validate, generatePin);
router.get('/me', authGuard, me);

export { router as authRouter };
export default router;
