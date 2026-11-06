import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import * as S from './notifications.service';
const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}
router.post('/send', authGuard, requireRoles(1,2), [body('gym_id').isString().notEmpty(), body('channel').isIn(['WHATSAPP','EMAIL','PUSH']), body('type').isString().notEmpty(), body('content').isString().notEmpty()], validate, async (req,res,next)=>{try{res.status(201).json({status:'success',notification:await S.sendNotification(req.body)});}catch(e){next(e);}});
router.get('/logs', authGuard, async (req:any,res,next)=>{try{res.json({status:'success',notifications:await S.listNotifications(req.query.gym_id||req.user?.gym_id)});}catch(e){next(e);}});
export {router as notificationsRouter};
export default router;
PY