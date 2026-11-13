import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '@config/database.config';

const PIN = '1234';

async function ensureUser(
  gymId: string,
  roleId: number,
  data: { first_name: string; last_name: string; phone: string }
): Promise<string> {
  const hash = await bcrypt.hash(PIN, 10);
  const existing: any[] = await AppDataSource.query(
    'SELECT id FROM users WHERE phone = ? LIMIT 1',
    [data.phone]
  );

  if (existing.length) {
    await AppDataSource.query(
      "UPDATE users SET pin_hash = ?, pin_temp = 0, status = 'ACTIVE' WHERE id = ?",
      [hash, existing[0].id]
    );
    return existing[0].id;
  }

  await AppDataSource.query(
    `INSERT INTO users (gym_id, role_id, first_name, last_name, phone, pin_hash, pin_temp, status)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'ACTIVE')`,
    [gymId, roleId, data.first_name, data.last_name, data.phone, hash]
  );

  const created: any[] = await AppDataSource.query(
    'SELECT id FROM users WHERE phone = ? LIMIT 1',
    [data.phone]
  );
  return created[0].id;
}

async function main() {
  await AppDataSource.initialize();

  try {
    const gyms: any[] = await AppDataSource.query(
      'SELECT id FROM gyms ORDER BY created_at ASC LIMIT 1'
    );
    if (!gyms.length) {
      throw new Error('No hay gimnasio en la base. Ejecutá backend/src/database/init.sql primero.');
    }
    const gymId: string = gyms[0].id;

    const roles: any[] = await AppDataSource.query(
      "SELECT id, name FROM roles WHERE name IN ('OWNER', 'MEMBER')"
    );
    const ownerRole = roles.find((r) => r.name === 'OWNER');
    const memberRole = roles.find((r) => r.name === 'MEMBER');
    if (!ownerRole || !memberRole) {
      throw new Error('Faltan los roles OWNER/MEMBER. Ejecutá init.sql.');
    }

    const ownerId = await ensureUser(gymId, ownerRole.id, {
      first_name: 'Carlos',
      last_name: 'Mendoza',
      phone: '+593999000001',
    });
    const memberId = await ensureUser(gymId, memberRole.id, {
      first_name: 'Ana',
      last_name: 'Torres',
      phone: '+593999000002',
    });

    // Plan demo
    let plans: any[] = await AppDataSource.query(
      "SELECT id FROM plans WHERE gym_id = ? AND name = 'Mensual Full' LIMIT 1",
      [gymId]
    );
    if (!plans.length) {
      await AppDataSource.query(
        `INSERT INTO plans (gym_id, name, description, duration_days, price)
         VALUES (?, 'Mensual Full', 'Acceso libre + rutina asignada', 30, 45.00)`,
        [gymId]
      );
      plans = await AppDataSource.query(
        "SELECT id FROM plans WHERE gym_id = ? AND name = 'Mensual Full' LIMIT 1",
        [gymId]
      );
    }

    // Membresía activa del socio demo
    const memberships: any[] = await AppDataSource.query(
      "SELECT id FROM memberships WHERE user_id = ? AND status = 'ACTIVE' LIMIT 1",
      [memberId]
    );
    if (!memberships.length) {
      await AppDataSource.query(
        `INSERT INTO memberships (user_id, plan_id, gym_id, start_date, end_date, status)
         VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'ACTIVE')`,
        [memberId, plans[0].id, gymId]
      );
    }

    // Productos demo
    const products: any[] = await AppDataSource.query(
      'SELECT id FROM products WHERE gym_id = ? LIMIT 1',
      [gymId]
    );
    if (!products.length) {
      await AppDataSource.query(
        `INSERT INTO products (gym_id, name, description, category, price, stock) VALUES
         (?, 'Whey Protein 2lb', 'Proteína de suero sabor chocolate', 'SUPPLEMENT', 32.00, 8),
         (?, 'Camiseta GymSync', 'Camiseta deportiva oficial', 'CLOTHING', 18.00, 12),
         (?, 'Shaker 600ml', 'Vaso mezclador con rejilla', 'ACCESSORY', 9.00, 3)`,
        [gymId, gymId, gymId]
      );
    }

    // Rutina demo
    const routines: any[] = await AppDataSource.query(
      'SELECT id FROM workout_routines WHERE gym_id = ? LIMIT 1',
      [gymId]
    );
    if (!routines.length) {
      await AppDataSource.query(
        `INSERT INTO workout_routines (gym_id, name, description, duration_weeks, difficulty)
         VALUES (?, 'Fuerza — Tren inferior', 'Sentadilla, prensa y peso muerto', 4, 'INTERMEDIATE')`,
        [gymId]
      );
    }

    console.log('');
    console.log('✅ Seed completado');
    console.log('   OWNER  → teléfono +593999000001 · PIN 1234 · id ' + ownerId);
    console.log('   SOCIO  → teléfono +593999000002 · PIN 1234 · id ' + memberId);
    console.log('');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('❌ Error en el seed:', err.message || err);
  process.exit(1);
});
