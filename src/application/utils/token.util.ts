import * as crypto from 'crypto';

/** Genera un token aleatorio en claro (solo viaja por email). */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash determinista (sha256) del token. Determinista a propósito: el endpoint
 * público de confirmación solo recibe el token y debe localizar la solicitud
 * por su hash (RN-006 — los tokens se almacenan hasheados, nunca en claro).
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
