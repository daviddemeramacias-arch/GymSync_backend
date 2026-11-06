import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import * as S from './routines.service';

const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}
router.post('/routines', authGuard, requireRoles(1,2), [body('gym_id').isString().notEmpty(), body('name').isString().notEmpty()], validate, async (req,res,next)=>{try{res.status(201).json({status:'success',routine:await S.createRoutine(req.body)});}catch(e){next(e);}});
router.get('/routines', authGuard, async (req:any,res,next)=>{try{res.json({status:'success',routines:await S.listRoutines(req.query.gym_id||req.user?.gym_id)});}catch(e){next(e);}});
router.post('/routines/:id/assign', authGuard, requireRoles(1,2), async (req:any,res,next)=>{try{const uid=req.body.user_id;if(!uid)throw new AppError('user_id requerido',400); S.assignRoutine(uid,req.params.id); res.json({status:'success',assigned:true});}catch(e){next(e);}});
router.get('/routines/my', authGuard, async (req:any,res,next)=>{try{const uid=req.query.user_id||req.user?.sub; res.json({status:'success',routine_ids:S.getAssignments(uid)});}catch(e){next(e);}});
router.post('/logs', authGuard, [body('user_id').isString().notEmpty(), body('exercise').isString().notEmpty()], validate, async (req,res,next)=>{try{res.status(201).json({status:'success',log:S.addLog(req.body)});}catch(e){next(e);}});
router.get('/suggestions', authGuard, async (req:any,res,next)=>{try{const uid=req.query.user_id||req.user?.sub; res.json({status:'success',suggestion:S.suggest(uid)});}catch(e){next(e);}});
export {router as routinesRouter};
export default router;
PY