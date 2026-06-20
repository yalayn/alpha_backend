import { Inject, Injectable } from '@nestjs/common';
import {
  EmailChangeRequestRepository,
  EMAIL_CHANGE_REQUEST_REPOSITORY,
} from '@domain/ports/email-change-request.repository.port';
import { InvalidTokenException } from '@domain/exceptions/invalid-token.exception';
import { TokenExpiredException } from '@domain/exceptions/token-expired.exception';
import {
  ConfirmEmailChangeDto,
  ConfirmEmailChangeResult,
} from '@application/dtos/confirm-email-change.dto';
import { hashToken } from '@application/utils/token.util';
import { ApplyEmailChangeUseCase } from '../apply-email-change/apply-email-change.use-case';

/**
 * Confirma uno de los dos tokens (endpoint público, RN-004). Al confirmar el
 * segundo, delega en `ApplyEmailChange` para persistir el cambio.
 */
@Injectable()
export class ConfirmEmailChangeUseCase {
  constructor(
    @Inject(EMAIL_CHANGE_REQUEST_REPOSITORY)
    private readonly emailChangeRepository: EmailChangeRequestRepository,
    private readonly applyEmailChange: ApplyEmailChangeUseCase,
  ) {}

  async execute(dto: ConfirmEmailChangeDto): Promise<ConfirmEmailChangeResult> {
    const tokenHash = hashToken(dto.token);

    // 1. Localizar la solicitud pendiente por el hash del token (uno solo uso).
    const request = await this.emailChangeRepository.findPendingByTokenHash(tokenHash);
    if (!request) {
      throw new InvalidTokenException();
    }

    // 2. Vigencia (RN-003).
    if (request.isExpired()) {
      throw new TokenExpiredException();
    }

    // 3. Marcar el lado correspondiente (idempotente si ya estaba confirmado).
    const side = request.sideForTokenHash(tokenHash)!;
    const confirmed = request.confirmSide(side);

    // 4. Si ambos quedan confirmados, aplicar el cambio; si no, persistir el avance.
    if (confirmed.bothConfirmed) {
      await this.applyEmailChange.execute(confirmed);
      return { side, bothConfirmed: true, applied: true };
    }

    await this.emailChangeRepository.save(confirmed);
    return { side, bothConfirmed: false, applied: false };
  }
}
