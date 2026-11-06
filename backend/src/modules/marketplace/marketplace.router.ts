import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import { AppDataSource } from '@config/database.config';

const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}

router.post('/products', authGuard, requireRoles(1,2), [
  body('gym_id').isString().notEmpty(), body('name').isString().notEmpty(), body('price').isNumeric()
], validate, async (req,res,next)=>{try{const r=AppDataSource.getRepository('products') as any;const p=r.create(req.body);await r.save(p);res.status(201).json({status:'success',product:p});}catch(e){next(e);}});

router.get('/products', authGuard, async (req:any,res,next)=>{try{const gym_id=req.query.gym_id||req.user?.gym_id;const r=AppDataSource.getRepository('products') as any;const list=await r.find({where:{gym_id,is_active:true}});res.json({status:'success',products:list});}catch(e){next(e);}});

router.patch('/products/:id', authGuard, requireRoles(1,2), async (req,res,next)=>{try{const r=AppDataSource.getRepository('products') as any;const p=await r.findOneBy({id:req.params.id});if(!p)throw new AppError('Producto no encontrado',404);r.merge(p,req.body);await r.save(p);res.json({status:'success',product:p});}catch(e){next(e);}});

// Orders
router.post('/orders', authGuard, [
  body('gym_id').isString().notEmpty(), body('user_id').isString().notEmpty(), body('product_id').isString().notEmpty()
], validate, async (req,res,next)=>{try{
  const {gym_id,user_id,product_id,quantity=1}=req.body;
  const pr=AppDataSource.getRepository('products') as any;
  const prod=await pr.findOneBy({id:product_id});
  if(!prod) throw new AppError('Producto no encontrado',404);
  if(prod.stock < quantity) throw new AppError('Stock insuficiente',400);
  prod.stock -= quantity;
  await pr.save(prod);
  const total = Number(prod.price)*quantity;
  const token = Math.floor(1000+Math.random()*9000).toString();
  const or=AppDataSource.getRepository('access_tokens') as any;
  const t=or.create({user_id,gym_id,token_type:'PICKUP',code_4digit:token,qr_payload:token,expires_at:new Date(Date.now()+24*60*60*1000)});
  await or.save(t);
  res.status(201).json({status:'success',order:{product_id,quantity,total,token}});
}catch(e){next(e);}});

export {router as marketplaceRouter};
export default router;
