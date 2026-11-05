import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import { AppDataSource } from '@config/database.config';

const router = Router();
function validate(req: any, _res: any, next: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array().map((e:any)=>e.msg).join(', '), 400));
  next();
}

// Bank accounts
router.post('/bank-accounts', authGuard, requireRoles(1,2), [
  body('gym_id').isString().notEmpty(),
  body('bank_name').isString().notEmpty(),
  body('account_number').isString().notEmpty(),
  body('account_holder').isString().notEmpty(),
], validate, async (req, res, next) => {
  try {
    const data = req.body;
    const r = AppDataSource.getRepository('bank_accounts') as any;
    const rec = r.create(data);
    await r.save(rec);
    res.status(201).json({ status: 'success', bank_account: rec });
  } catch (e) { next(e); }
});

router.get('/bank-accounts', authGuard, async (req: any, res, next) => {
  try {
    const gym_id = req.query.gym_id || req.user?.gym_id;
    const r = AppDataSource.getRepository('bank_accounts') as any;
    const list = await r.find({ where: { gym_id, is_active: true } });
    res.json({ status: 'success', bank_accounts: list });
  } catch (e) { next(e); }
});

// Payments
router.post('/payments', authGuard, [
  body('user_id').isString().notEmpty(),
  body('gym_id').isString().notEmpty(),
  body('amount').isNumeric(),
  body('method').isIn(['CASH','TRANSFER','CARD']),
], validate, async (req, res, next) => {
  try {
    const r = AppDataSource.getRepository('payments') as any;
    const rec = r.create({ status: 'PENDING', ...req.body });
    await r.save(rec);
    res.status(201).json({ status: 'success', payment: rec });
  } catch (e) { next(e); }
});

router.get('/payments/pending', authGuard, requireRoles(1,2), async (req: any, res, next) => {
  try {
    const gym_id = req.query.gym_id || req.user?.gym_id;
    const r = AppDataSource.getRepository('payments') as any;
    const list = await r.find({ where: { gym_id, status: 'PENDING' }, order: { created_at: 'DESC' } });
    res.json({ status: 'success', payments: list });
  } catch (e) { next(e); }
});

router.patch('/payments/:id/approve', authGuard, requireRoles(1,2), async (req: any, res, next) => {
  try {
    const r = AppDataSource.getRepository('payments') as any;
    const p = await r.findOneBy({ id: req.params.id });
    if (!p) throw new AppError('Pago no encontrado', 404);
    p.status = 'APPROVED';
    p.approved_by = req.user.sub;
    p.approved_at = new Date();
    p.auto_validated = req.body.auto_validated ? true : p.auto_validated;
    await r.save(p);
    res.json({ status: 'success', payment: p });
  } catch (e) { next(e); }
});

router.patch('/payments/:id/reject', authGuard, requireRoles(1,2), async (req, res, next) => {
  try {
    const r = AppDataSource.getRepository('payments') as any;
    const p = await r.findOneBy({ id: req.params.id });
    if (!p) throw new AppError('Pago no encontrado', 404);
    p.status = 'REJECTED';
    p.rejected_reason = req.body.reason || null;
    await r.save(p);
    res.json({ status: 'success', payment: p });
  } catch (e) { next(e); }
});

export { router as financeRouter };
export default router;
