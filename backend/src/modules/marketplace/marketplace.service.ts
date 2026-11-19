import { AppDataSource } from '@config/database.config';
import { AppError } from '@shared/utils/app-error';
export async function createProduct(d:any){ await AppDataSource.query('INSERT INTO products (gym_id,name,description,category,price,stock,min_stock,image_url,is_active) VALUES (?,?,?,?,?,?,?,?,?)',[d.gym_id,d.name,d.description||null,d.category||'SUPPLEMENT',d.price,d.stock||0,d.min_stock||5,d.image_url||null,d.is_active!==false]); const rows=await AppDataSource.query('SELECT * FROM products WHERE gym_id=? AND name=? ORDER BY created_at DESC LIMIT 1',[d.gym_id,d.name]); return rows[0]; }
export async function listProducts(gym_id:string){ return AppDataSource.query('SELECT * FROM products WHERE gym_id=? AND is_active=true',[gym_id]); }
export async function updateProduct(id:string,d:any){ const fields=[];const p=[]; for(const k of ['name','description','category','price','stock','min_stock','image_url','is_active']){if(d[k]!==undefined){fields.push(k+'=?');p.push(d[k]);}} if(!fields.length) throw new Error('Sin cambios'); p.push(id); await AppDataSource.query('UPDATE products SET '+fields.join(',')+' WHERE id=?',p); const rows=await AppDataSource.query('SELECT * FROM products WHERE id=?',[id]); if(!rows.length) throw new Error('Producto no encontrado'); return rows[0]; }

export async function createOrder(gym_id:string,user_id:string,product_id:string,quantity=1){
  const prods = await AppDataSource.query('SELECT * FROM products WHERE id=?', [product_id]);
  const prod = prods[0];
  if (!prod) throw new AppError('Producto no encontrado', 404);
  if (prod.stock < quantity) throw new AppError('Stock insuficiente', 400);

  const token = String(Math.floor(1000 + Math.random() * 9000));
  const total = Number(prod.price) * quantity;

  await AppDataSource.query('UPDATE products SET stock=stock-? WHERE id=?', [quantity, product_id]);
  await AppDataSource.query(
    `INSERT INTO orders (gym_id,user_id,product_id,product_name,quantity,unit_price,total,pickup_token,status)
     VALUES (?,?,?,?,?,?,?,?,'PENDING')`,
    [gym_id, user_id, product_id, prod.name, quantity, prod.price, total, token]
  );
  await AppDataSource.query(
    'INSERT INTO access_tokens (user_id,gym_id,token_type,code_4digit,qr_payload,expires_at) VALUES (?,?,?,?,?,DATE_ADD(NOW(),INTERVAL 1 DAY))',
    [user_id, gym_id, 'PICKUP', token, token]
  );

  return { product_id, product_name: prod.name, quantity, unit_price: prod.price, total, token };
}

export async function listOrders(gym_id: string) {
  return AppDataSource.query(
    `SELECT o.id, o.gym_id, o.user_id, o.product_name, o.quantity, o.unit_price,
            o.total, o.pickup_token, o.status, o.created_at,
            u.first_name, u.last_name, u.phone
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.gym_id = ?
     ORDER BY o.created_at DESC
     LIMIT 200`,
    [gym_id]
  );
}

export async function updateOrderStatus(id: string, status: string) {
  const allowed = ['PENDING', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(status)) throw new AppError('Estado inválido', 400);
  await AppDataSource.query('UPDATE orders SET status=? WHERE id=?', [status, id]);
  const rows = await AppDataSource.query('SELECT * FROM orders WHERE id=?', [id]);
  if (!rows.length) throw new AppError('Pedido no encontrado', 404);
  return rows[0];
}
