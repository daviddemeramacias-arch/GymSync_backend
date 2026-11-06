import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import { AppDataSource } from '@config/database.config';

const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}

router.post('/send', authGuard, requireRoles(1,2), [
  body('gym_id').isString().notEmpty(), body('channel').isIn(['WHATSAPP','EMAIL','PUSH']),
  body('type').isString().notEmpty(), body('content').isString().notEmpty()
], validate, async (req,res,next)=>{try{
  const r=AppDataSource.getRepository('notification_logs') as any;
  const rec=r.create({...req.body,status:'PENDING'});
  await r.save(rec);
  // mock send
  rec.status='SENT'; rec.sent_at=new Date();
  await r.save(rec);
  res.status(201).json({status:'success',notification:rec});
}catch(e){next(e);}});

router.get('/logs', authGuard, async (req:any,res,next)=>{try{
  const gym_id=req.query.gym_id||req.user?.gym_id;
  const r=AppDataSource.getRepository('notification_logs') as any;
  const list=await r.find({where:{gym_id},order:{created_at:'DESC'}});
  res.json({status:'success',notifications:list});
}catch(e){next(e);}});

export {router as notificationsRouter};
export default router;
