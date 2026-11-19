-- Migración: acortar el ID del gimnasio a '001'
-- Valor anterior (para revertir si hace falta): 00000000-0000-0000-0000-000000000001
-- Ejecutar: mysql -u gymsync_user -p gymsync_db < migrate-gym-id.sql

SET FOREIGN_KEY_CHECKS = 0;

-- El id ya no se genera automáticamente: en adelante el gimnasio es '001'.
ALTER TABLE gyms ALTER COLUMN id DROP DEFAULT;

UPDATE gyms            SET id      = '001' WHERE id      = '00000000-0000-0000-0000-000000000001';
UPDATE users           SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE plans           SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE memberships     SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE products        SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE payments        SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE bank_accounts   SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE access_logs     SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE access_tokens   SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';
UPDATE notification_logs SET gym_id = '001' WHERE gym_id = '00000000-0000-0000-0000-000000000001';
UPDATE workout_routines SET gym_id = '001' WHERE gym_id = '00000000-0000-0000-0000-000000000001';
UPDATE workout_logs    SET gym_id  = '001' WHERE gym_id  = '00000000-0000-0000-0000-000000000001';

SET FOREIGN_KEY_CHECKS = 1;
