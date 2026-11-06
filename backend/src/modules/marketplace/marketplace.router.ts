import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import * as S from './marketplace.service';
const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}
router.post('/products', authGuard, requireRoles(1,2), [body('gym_id').isString().notEmpty(), body('name').isString().notEmpty(), body('price').isNumeric()], validate, async (req,res,next)=>{try{res.status(201).json({status:'success',product:await S.createProduct(req.body)});}catch(e){next(e);}});
router.get('/products', authGuard, async (req:any,res,next)=>{try{res.json({status:'success',products:await S.listProducts(req.query.gym_id||req.user?.gym_id)});}catch(e){next(e);}});
router.patch('/products/:id', authGuard, requireRoles(1,2), async (req,res,next)=>{try{res.json({status:'success',product:await S.updateProduct(req.params.id,req.body)});}catch(e){next(e);}});
router.post('/orders', authGuard, [body('gym_id').isString().notEmpty(), body('user_id').isString().notEmpty(), body('product_id').isString().notEmpty()], validate, async (req,res,next)=>{try{const {gym_id,user_id,product_id,quantity=1}=req.body; res.status(201).json({status:'success',order:await S.createOrder(gym_id,user_id,product_id,quantity)});}catch(e){next(e);}});
export {router as marketplaceRouter};
export default router;
