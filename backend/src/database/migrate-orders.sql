-- Registro de compras realizadas desde la PWA del socio.
CREATE TABLE IF NOT EXISTS orders (
  id            CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  gym_id        CHAR(36) NOT NULL,
  user_id       CHAR(36) NOT NULL,
  product_id    CHAR(36) NOT NULL,
  product_name  VARCHAR(150) NOT NULL,
  quantity      INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price    DECIMAL(8,2) NOT NULL,
  total         DECIMAL(8,2) NOT NULL,
  pickup_token  CHAR(4) NOT NULL,
  status        ENUM('PENDING','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_ibfk_1 FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  CONSTRAINT orders_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT orders_ibfk_3 FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
