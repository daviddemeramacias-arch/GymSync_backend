import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import * as S from './finance.service';
const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}
router.post('/bank-accounts', authGuard, requireRoles(1,2), [body('gym_id').isString().notEmpty(), body('bank_name').isString().notEmpty(), body('account_number').isString().notEmpty(), body('account_holder').isString().notEmpty()], validate, async (req,res,next)=>{try{res.status(201).json({status:'success',bank_account:await S.createBankAccount(req.body)});}catch(e){next(e);}});
router.get('/bank-accounts', authGuard, async (req:any,res,next)=>{try{res.json({status:'success',bank_accounts:await S.listBankAccounts(req.query.gym_id||req.user?.gym_id)});}catch(e){next(e);}});
router.post('/payments', authGuard, [body('user_id').isString().notEmpty(), body('gym_id').isString().notEmpty(), body('amount').isNumeric(), body('method').isIn(['CASH','TRANSFER','CARD'])], validate, async (req,res,next)=>{try{res.status(201).json({status:'success',payment:await S.createPayment(req.body)});}catch(e){next(e);}});
router.get('/payments/pending', authGuard, requireRoles(1,2), async (req:any,res,next)=>{try{res.json({status:'success',payments:await S.listPendingPayments(req.query.gym_id||req.user?.gym_id)});}catch(e){next(e);}});
router.patch('/payments/:id/approve', authGuard, requireRoles(1,2), async (req:any,res,next)=>{try{res.json({status:'success',payment:await S.approvePayment(req.params.id, req.user.sub, !!req.body?.auto_validated)});}catch(e){next(e);}});
router.patch('/payments/:id/reject', authGuard, requireRoles(1,2), async (req:any,res,next)=>{try{res.json({status:'success',payment:await S.rejectPayment(req.params.id, req.body?.reason||null)});}catch(e){next(e);}});
export { router as financeRouter };
export default router;
PY