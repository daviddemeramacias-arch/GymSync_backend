import { Router } from 'express';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { authGuard, requireRoles } from '../auth/auth.middleware';
import { AppError } from '@shared/utils/app-error';
import { AppDataSource } from '@config/database.config';

const router = Router();
function validate(req:any,_res:any,next:any){const e=validationResult(req);if(!e.isEmpty())return next(new AppError(e.array().map((x:any)=>x.msg).join(', '),400));next();}

router.post('/validate', authGuard, [
  body('gym_id').isString().notEmpty(),
  body('method').isIn(['QR','PIN','BIOMETRIC','MANUAL']),
], validate, async (req,res,next)=>{
  try{
    const { gym_id, method, code_4digit, user_id } = req.body;
    if (code_4digit) {
      const rows = await AppDataSource.query('SELECT * FROM access_tokens WHERE code_4digit=? AND gym_id=? AND used=false AND expires_at>NOW()', [code_4digit,gym_id]);
      if(!rows.length) return res.status(403).json({status:'error',result:'DENIED',reason:'Token inválido o usado'});
      const t = rows[0];
      await AppDataSource.query('UPDATE access_tokens SET used=true, used_at=NOW() WHERE id=?',[t.id]);
      await AppDataSource.query('INSERT INTO access_logs (user_id,gym_id,method,result,token_id) VALUES (?,?,?,?,?)',[t.user_id,gym_id,method,'GRANTED',t.id]);
      return res.json({status:'success',result:'GRANTED',user_id:t.user_id,token_type:t.token_type});
    }
    // monthly via user_id + membership
    if (user_id) {
      const m = await AppDataSource.query("SELECT * FROM memberships WHERE user_id=? AND gym_id=? AND status='ACTIVE' AND end_date>=CURDATE() LIMIT 1",[user_id,gym_id]);
      if(m.length){ await AppDataSource.query("INSERT INTO access_logs (user_id,gym_id,method,result) VALUES (?,?,?,?)",[user_id,gym_id,method||'BIOMETRIC','GRANTED']); return res.json({status:'success',result:'GRANTED',user_id}); }
      await AppDataSource.query("INSERT INTO access_logs (user_id,gym_id,method,result,denied_reason) VALUES (?,?,?,?,?)",[user_id,gym_id,method||'BIOMETRIC','DENIED','Membresía inactiva o vencida']);
      return res.status(403).json({status:'error',result:'DENIED',reason:'Membresía inactiva o vencida'});
    }
    res.status(400).json({status:'error',message:'code_4digit o user_id requerido'});
  }catch(e){next(e);}
});

router.get('/aforo', authGuard, async (req:any,res,next)=>{
  try{
    const gym_id=req.query.gym_id||req.user?.gym_id;
    const rows=await AppDataSource.query("SELECT COUNT(*) c FROM access_logs WHERE gym_id=? AND result='GRANTED' AND DATE(created_at)=CURDATE()",[gym_id]);
    res.json({status:'success',aforo: rows[0].c});
  }catch(e){next(e);}
});

export {router as accessRouter};
export default router;