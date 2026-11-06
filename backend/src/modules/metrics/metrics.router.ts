import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import * as S from './metrics.service';
const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}
router.get('/kpis', authGuard, async (req:any,res,next)=>{try{res.json({status:'success',kpis:await S.kpis(req.query.gym_id||req.user?.gym_id)});}catch(e){next(e);}});
router.get('/arqueo', authGuard, async (req:any,res,next)=>{try{res.json({status:'success',arqueo:await S.arqueo(req.query.gym_id||req.user?.gym_id, req.query.date)});}catch(e){next(e);}});
export {router as metricsRouter};
export default router;