export const TEMPLATES: Record<string,string> = {
  PIN_DELIVERY: 'Tu PIN de acceso GymSync es: {PIN}. No lo compartas.',
  PAYMENT_REMINDER: 'Hola {NAME}, tu membresia vence pronto. Renueva hoy.',
  PAYMENT_CONFIRMED: 'Pago confirmado. ¡Gracias!',
  OVERDUE_ALERT: 'Tu membresia esta vencida. Renueva para ingresar.',
  PROMO: 'Promocion del dia en GymSync. Visitanos!',
  WEEKLY_REPORT: 'Resumen semanal de entrenamiento.',
};
export function render(tpl:string, vars:Record<string,string>){ return tpl.replace(/\{(\w+)\}/g,(_,k)=>vars[k]||''); }
export async function sendWhatsApp(phone:string, content:string, retries=3){
  // mock sender: simulate occasional failure for retry
  for(let i=0;i<retries;i++){
    try {
      // real integration would call WhatsApp API here
      // simulate success
      return {status:'SENT', attempts:i+1};
    } catch(e){
      if(i===retries-1) return {status:'FAILED', attempts:i+1, error:String(e)};
    }
  }
  return {status:'FAILED', attempts:retries};
}
