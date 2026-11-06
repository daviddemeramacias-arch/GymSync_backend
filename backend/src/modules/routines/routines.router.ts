import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import { AppDataSource } from '@config/database.config';

const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}

router.post('/routines', authGuard, requireRoles(1,2), [
  body('gym_id').isString().notEmpty(), body('name').isString().notEmpty()
], validate, async (req,res,next)=>{try{const r=AppDataSource.getRepository('workout_routines') as any;const rec=r.create(req.body);await r.save(rec);res.status(201).json({status:'success',routine:rec});}catch(e){next(e);}});

router.get('/routines', authGuard, async (req:any,res,next)=>{try{const gym_id=req.query.gym_id||req.user?.gym_id;const r=AppDataSource.getRepository('workout_routines') as any;const list=await r.find({where:{gym_id,is_active:true}});res.json({status:'success',routines:list});}catch(e){next(e);}});

// Assignments (in-memory for now)
const assignments: Record<string, string[]> = {};
const logs: any[] = [];

router.post('/routines/:id/assign', authGuard, requireRoles(1,2), async (req:any,res,next)=>{try{const uid=req.body.user_id;if(!uid)throw new AppError('user_id requerido',400);assignments[uid]=assignments[uid]||[];assignments[uid].push(req.params.id);res.json({status:'success',assigned:true});}catch(e){next(e);}});

router.get('/routines/my', authGuard, async (req:any,res,next)=>{try{const uid=req.query.user_id||req.user?.sub;const ids=assignments[uid]||[];res.json({status:'success',routine_ids:ids});}catch(e){next(e);}});

router.post('/logs', authGuard, [
  body('user_id').isString().notEmpty(), body('exercise').isString().notEmpty()
], validate, async (req,res,next)=>{try{const l={...req.body,created_at:new Date()};logs.push(l);res.status(201).json({status:'success',log:l});}catch(e){next(e);}});

router.get('/suggestions', authGuard, async (req:any,res,next)=>{try{
  const uid=req.query.user_id||req.user?.sub;
  const userLogs=logs.filter(l=>l.user_id===uid);
  const lastExercise=userLogs[userLogs.length-1]?.exercise||'ninguno';
  res.json({status:'success',suggestion:`Próximo: incrementar carga 5-10% en ${lastExercise}`});
}catch(e){next(e);}});

export {router as routinesRouter};
export default router;
