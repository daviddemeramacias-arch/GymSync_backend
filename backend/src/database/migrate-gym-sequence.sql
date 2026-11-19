-- Secuencia persistente de Gym ID.
-- El contador vive aparte de los usuarios: dar de baja o borrar un socio
-- nunca hace que se reutilice un ID ya asignado.
CREATE TABLE IF NOT EXISTS gym_sequences (
  name       VARCHAR(30) NOT NULL PRIMARY KEY,
  next_value INT UNSIGNED NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO gym_sequences (name, next_value) VALUES ('GYM_ID', 1);

-- Si ya existen gimnasios (por ejemplo '001'), arrancar justo después del mayor.
UPDATE gym_sequences
SET next_value = GREATEST(
  next_value,
  (SELECT IFNULL(MAX(CAST(id AS UNSIGNED)), 0) + 1 FROM gyms WHERE id REGEXP '^[0-9]+$')
)
WHERE name = 'GYM_ID';

SELECT name, next_value FROM gym_sequences WHERE name = 'GYM_ID';
