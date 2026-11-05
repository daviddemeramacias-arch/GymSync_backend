import { AppDataSource } from '@config/database.config';
import { Plan, Membership } from './member.entity';
import { AppError } from '@shared/utils/app-error';

function planRepo() { return AppDataSource.getRepository(Plan); }
function membershipRepo() { return AppDataSource.getRepository(Membership); }

export async function createPlan(data: any) {
  const repo = planRepo();
  const plan = repo.create(data);
  return repo.save(plan);
}

export async function listPlans(gym_id: string) {
  return planRepo().find({ where: { gym_id } as any });
}

export async function getPlan(id: string) {
  const plan = await planRepo().findOneBy({ id } as any);
  if (!plan) throw new AppError('Plan no encontrado', 404);
  return plan;
}

export async function updatePlan(id: string, data: any) {
  const repo = planRepo();
  const plan = await getPlan(id);
  repo.merge(plan, data);
  return repo.save(plan);
}

export async function assignMembership(data: { user_id: string; plan_id: string; gym_id: string; start_date?: Date }) {
  const plan = await getPlan(data.plan_id);
  const start = data.start_date ? new Date(data.start_date) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + (plan as any).duration_days);
  const repo = membershipRepo();
  const m = repo.create({
    user_id: data.user_id,
    plan_id: data.plan_id,
    gym_id: data.gym_id,
    start_date: start,
    end_date: end,
    status: 'ACTIVE',
  });
  return repo.save(m);
}

export async function listMembershipsByUser(user_id: string) {
  return membershipRepo().find({ where: { user_id } as any, order: { created_at: 'DESC' } as any });
}

export async function freezeMembership(id: string) {
  const repo = membershipRepo();
  const m = await repo.findOneBy({ id } as any);
  if (!m) throw new AppError('Membresía no encontrada', 404);
  (m as any).status = 'FROZEN';
  (m as any).frozen_at = new Date();
  return repo.save(m);
}
