import { Inject, Injectable } from '@nestjs/common';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import {
  EmailChangeRequestRepository,
  EMAIL_CHANGE_REQUEST_REPOSITORY,
} from '@domain/ports/email-change-request.repository.port';
import { EmailChangeNotFoundException } from '@domain/exceptions/email-change-not-found.exception';

/** Devuelve la solicitud pendiente del usuario, o 404 si no hay (SPE-008). */
@Injectable()
export class GetEmailChangeStatusUseCase {
  constructor(
    @Inject(EMAIL_CHANGE_REQUEST_REPOSITORY)
    private readonly emailChangeRepository: EmailChangeRequestRepository,
  ) {}

  async execute(userId: string): Promise<EmailChangeRequest> {
    const request = await this.emailChangeRepository.findPendingByUserId(userId);
    if (!request) {
      throw new EmailChangeNotFoundException();
    }
    return request;
  }
}
