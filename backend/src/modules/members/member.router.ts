import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles, AuthRequest } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import { AppDataSource } from '@config/database.config';
import { normalizeGymId } from '@shared/utils/gym';
import { createPinForUser } from '../auth/auth.service';
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
    const plan = await createPlan({ ...req.body, gym_id: normalizeGymId(req.body.gym_id) });
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
    const m = await assignMembership({ ...req.body, gym_id: normalizeGymId(req.body.gym_id) });
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

// Create socio + PIN
router.post('/users', authGuard, requireRoles(1,2), [
  body('gym_id').isString().notEmpty(),
  body('first_name').isString().notEmpty(),
  body('last_name').isString().notEmpty(),
  body('phone').isString().notEmpty(),
], validate, async (req: any, res: any, next: any) => {
  try {
    // 'roles' no es una entidad de TypeORM: se consulta con SQL directo.
    const roles: any[] = await AppDataSource.query(
      "SELECT id FROM roles WHERE name = 'MEMBER' LIMIT 1"
    );
    const role = roles[0];
    if (!role) throw new AppError('Rol MEMBER no encontrado', 500);
    const ur = AppDataSource.getRepository('users') as any;
    const u = ur.create({
      ...req.body,
      gym_id: normalizeGymId(req.body.gym_id),
      role_id: role.id,
      status: 'ACTIVE',
      pin_temp: true,
    });
    await ur.save(u);
    const { pin } = await createPinForUser(u.id);
    res.status(201).json({ status: 'success', user: u, pin });
  } catch (e) { next(e); }
});

// Listado de socios con su plan, PIN (mascarado) y gimnasio
router.get('/socios', authGuard, requireRoles(1, 2), async (req: any, res: any, next: any) => {
  try {
    const gymId = normalizeGymId(req.query.gym_id || req.user?.gym_id);
    const socios = await AppDataSource.query(
      `SELECT u.id, u.first_name, u.last_name, u.phone, u.email, u.gym_id,
              u.status, u.pin_temp,
              CASE WHEN u.pin_hash IS NOT NULL THEN 1 ELSE 0 END AS has_pin,
              m.id AS membership_id, m.status AS membership_status,
              m.start_date, m.end_date,
              p.id AS plan_id, p.name AS plan_name, p.price AS plan_price
       FROM users u
       LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'ACTIVE'
       LEFT JOIN plans p ON p.id = m.plan_id
       WHERE u.role_id = (SELECT id FROM roles WHERE name='MEMBER' LIMIT 1)
         AND u.gym_id = ?
       ORDER BY u.created_at DESC`,
      [gymId]
    );
    res.json({ status: 'success', socios });
  } catch (e) { next(e); }
});

// Editar datos del socio
router.patch('/users/:id', authGuard, requireRoles(1, 2), [
  body('first_name').optional().isString().notEmpty(),
  body('last_name').optional().isString().notEmpty(),
  body('phone').optional().isString().notEmpty(),
], validate, async (req: any, res: any, next: any) => {
  try {
    const fields: string[] = [];
    const values: any[] = [];
    for (const key of ['first_name', 'last_name', 'phone', 'email', 'status']) {
      if (req.body[key] !== undefined) { fields.push(`${key}=?`); values.push(req.body[key]); }
    }
    if (!fields.length) throw new AppError('Sin cambios para actualizar', 400);
    values.push(req.params.id, normalizeGymId(req.user?.gym_id));
    await AppDataSource.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id=? AND gym_id=?`, values
    );
    const rows = await AppDataSource.query(
      'SELECT id, first_name, last_name, phone, email, gym_id, status FROM users WHERE id=?',
      [req.params.id]
    );
    res.json({ status: 'success', user: rows[0] });
  } catch (e) { next(e); }
});

// Dar de baja (baja lógica: no se borra el historial)
router.patch('/users/:id/deactivate', authGuard, requireRoles(1, 2), async (req: any, res: any, next: any) => {
  try {
    const gymId = normalizeGymId(req.user?.gym_id);
    await AppDataSource.query(
      "UPDATE users SET status='INACTIVE' WHERE id=? AND gym_id=?",
      [req.params.id, gymId]
    );
    await AppDataSource.query(
      "UPDATE memberships SET status='CANCELLED' WHERE user_id=? AND status='ACTIVE'",
      [req.params.id]
    );
    res.json({ status: 'success', message: 'Socio dado de baja' });
  } catch (e) { next(e); }
});

// Cambiar el plan de una membresía activa
router.patch('/memberships/:id/plan', authGuard, requireRoles(1, 2), [
  body('plan_id').isString().notEmpty(),
], validate, async (req: any, res: any, next: any) => {
  try {
    const plans = await AppDataSource.query('SELECT duration_days FROM plans WHERE id=?', [req.body.plan_id]);
    if (!plans.length) throw new AppError('Plan no encontrado', 404);
    await AppDataSource.query(
      `UPDATE memberships SET plan_id=?, end_date=DATE_ADD(CURDATE(), INTERVAL ? DAY), status='ACTIVE' WHERE id=?`,
      [req.body.plan_id, plans[0].duration_days, req.params.id]
    );
    const rows = await AppDataSource.query('SELECT * FROM memberships WHERE id=?', [req.params.id]);
    res.json({ status: 'success', membership: rows[0] });
  } catch (e) { next(e); }
});

export { router as membersRouter };
export default router;
