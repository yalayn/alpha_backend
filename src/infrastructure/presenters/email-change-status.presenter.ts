import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';

/** Mapea la solicitud de dominio al schema `EmailChangeStatus` — nunca expone tokens (RN-006). */
export class EmailChangeStatusPresenter {
  static toResponse(request: EmailChangeRequest) {
    return {
      newEmail: request.newEmail,
      oldEmailConfirmed: request.oldConfirmed,
      newEmailConfirmed: request.newConfirmed,
      status: request.status,
      expiresAt: request.expiresAt.toISOString(),
    };
  }
}
