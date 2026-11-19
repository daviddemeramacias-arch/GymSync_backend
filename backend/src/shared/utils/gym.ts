/** ID corto del gimnasio y compatibilidad con el UUID usado antes. */
export const DEFAULT_GYM_ID = '001';
const LEGACY_GYM_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Acepta IDs numéricos (1, 01, 001, 002...) y los devuelve con 3 dígitos.
 * El UUID anterior y los valores vacíos se convierten al gimnasio inicial.
 */
export function normalizeGymId(value: unknown): string {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id || id === LEGACY_GYM_ID) return DEFAULT_GYM_ID;
  if (/^\d{1,3}$/.test(id)) return id.padStart(3, '0');
  return id;
}
