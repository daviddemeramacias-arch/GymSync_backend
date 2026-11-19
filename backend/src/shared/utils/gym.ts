/** ID corto del gimnasio y compatibilidad con el UUID usado antes. */
export const DEFAULT_GYM_ID = '001';
const LEGACY_GYM_ID = '00000000-0000-0000-0000-000000000001';

/** Acepta el ID nuevo, el UUID anterior o un valor vacío y siempre devuelve '001'. */
export function normalizeGymId(value: unknown): string {
  const id = typeof value === 'string' ? value.trim() : '';
  return !id || id === LEGACY_GYM_ID ? DEFAULT_GYM_ID : id;
}
