import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles, AuthRequest } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import {
  createPlan, listPlans, updatePlan, assignMembership,
  listMembershipsByUser, freezeMembership,
} from './member.service';

const router = Router();

function validate(req: any, _res: any, next: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array().map((e: any) => e.msg).join(', '), 400));
  next();
}

// Plans
router.post('/plans', authGuard, requireRoles(1, 2), [
  body('gym_id').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('price').isNumeric(),
], validate, async (req: any, res: any, next: any) => {
  try {
    const plan = await createPlan(req.body);
    res.status(201).json({ status: 'success', plan });
  } catch (e) { next(e); }
});

router.get('/plans', authGuard, async (req: any, res, next) => {
  try {
    const gym_id = req.query.gym_id || req.user?.gym_id;
    const plans = await listPlans(gym_id);
    res.json({ status: 'success', plans });
  } catch (e) { next(e); }
});

router.patch('/plans/:id', authGuard, requireRoles(1, 2), async (req: any, res: any, next: any) => {
  try {
    const plan = await updatePlan(req.params.id, req.body);
    res.json({ status: 'success', plan });
  } catch (e) { next(e); }
});

// Memberships
router.post('/memberships', authGuard, requireRoles(1, 2), [
  body('user_id').isString().notEmpty(),
  body('plan_id').isString().notEmpty(),
  body('gym_id').isString().notEmpty(),
], validate, async (req: any, res: any, next: any) => {
  try {
    const m = await assignMembership(req.body);
    res.status(201).json({ status: 'success', membership: m });
  } catch (e) { next(e); }
});

router.get('/memberships/user/:user_id', authGuard, async (req: any, res: any, next: any) => {
  try {
    const list = await listMembershipsByUser(req.params.user_id);
    res.json({ status: 'success', memberships: list });
  } catch (e) { next(e); }
});

router.patch('/memberships/:id/freeze', authGuard, requireRoles(1, 2), async (req: any, res: any, next: any) => {
  try {
    const m = await freezeMembership(req.params.id);
    res.json({ status: 'success', membership: m });
  } catch (e) { next(e); }
});

export { router as membersRouter };
export default router;
