import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import { UserRepository, USER_REPOSITORY } from '@domain/ports/user.repository.port';
import {
  EmailChangeRequestRepository,
  EMAIL_CHANGE_REQUEST_REPOSITORY,
} from '@domain/ports/email-change-request.repository.port';
import { EmailSender, EMAIL_SENDER } from '@domain/ports/email-sender.port';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { EmailUnchangedException } from '@domain/exceptions/email-unchanged.exception';
import { EmailAlreadyInUseException } from '@domain/exceptions/email-already-in-use.exception';
import { RequestEmailChangeDto } from '@application/dtos/request-email-change.dto';
import { generateRawToken, hashToken } from '@application/utils/token.util';

/** Token de configuración: base URL del frontend para construir el enlace del correo. */
export const EMAIL_CHANGE_APP_URL = Symbol('EmailChangeAppUrl');

/** Vigencia de los tokens (RN-003 — 1 hora por defecto). */
const TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class RequestEmailChangeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_CHANGE_REQUEST_REPOSITORY)
    private readonly emailChangeRepository: EmailChangeRequestRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
    @Inject(EMAIL_CHANGE_APP_URL)
    private readonly appUrl: string,
  ) {}

  async execute(dto: RequestEmailChangeDto): Promise<EmailChangeRequest> {
    // 1. El usuario debe existir (identidad desde el JWT).
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundException(dto.userId);
    }

    // 2. El nuevo email debe ser distinto del actual (RN-002).
    const newEmail = dto.newEmail.trim().toLowerCase();
    if (newEmail === user.email.toLowerCase()) {
      throw new EmailUnchangedException();
    }

    // 3. ...y no estar en uso por otro usuario (re-validado al aplicar, RN-002).
    const existing = await this.userRepository.findByEmail(newEmail);
    if (existing && existing.id !== user.id) {
      throw new EmailAlreadyInUseException(newEmail);
    }

    // 4. Una sola solicitud pendiente por usuario: la anterior se reemplaza (RN-005).
    await this.emailChangeRepository.deletePendingByUserId(user.id);

    // 5. Dos tokens con expiración; se almacenan hasheados (RN-003, RN-006).
    const oldRawToken = generateRawToken();
    const newRawToken = generateRawToken();
    const now = new Date();
    const request = new EmailChangeRequest(
      crypto.randomUUID(),
      user.id,
      newEmail,
      hashToken(oldRawToken),
      hashToken(newRawToken),
      'pending',
      now,
      new Date(now.getTime() + TOKEN_TTL_MS),
    );
    await this.emailChangeRepository.save(request);

    // 6. Un correo a cada dirección con su propio enlace de confirmación.
    await this.emailSender.send(this.buildEmail(user.email, oldRawToken, newEmail, true));
    await this.emailSender.send(this.buildEmail(newEmail, newRawToken, newEmail, false));

    return request;
  }

  private buildEmail(to: string, rawToken: string, newEmail: string, isCurrent: boolean) {
    const link = `${this.appUrl}/account/email-change/confirm?token=${rawToken}`;
    const audience = isCurrent
      ? 'Recibes este correo en tu dirección actual'
      : 'Recibes este correo en la nueva dirección solicitada';
    return {
      to,
      subject: 'Confirma el cambio de email de tu cuenta',
      body:
        `${audience}.\n\n` +
        `Se solicitó cambiar el email de la cuenta a: ${newEmail}.\n` +
        `Para autorizarlo, confirma desde este enlace (válido 1 hora):\n\n${link}\n\n` +
        `El cambio solo se aplica cuando se confirman AMBOS correos. ` +
        `Si no reconoces esta solicitud, ignora este mensaje.`,
    };
  }
}
