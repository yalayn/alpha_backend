import { EmailChangeRequest } from '../entities/email-change-request.entity';

export interface EmailChangeRequestRepository {
  save(request: EmailChangeRequest): Promise<void>;
  /** Solicitud pendiente del usuario (estado `pending`), o null si no hay. */
  findPendingByUserId(userId: string): Promise<EmailChangeRequest | null>;
  /** Solicitud pendiente cuyo lado actual o nuevo tenga este hash de token. */
  findPendingByTokenHash(tokenHash: string): Promise<EmailChangeRequest | null>;
  /** Elimina la solicitud pendiente del usuario (al reemplazarla por una nueva, RN-005). */
  deletePendingByUserId(userId: string): Promise<void>;
}

export const EMAIL_CHANGE_REQUEST_REPOSITORY = Symbol('EmailChangeRequestRepository');
