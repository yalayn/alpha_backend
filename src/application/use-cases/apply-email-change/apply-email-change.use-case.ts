import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import { UserRepository, USER_REPOSITORY } from '@domain/ports/user.repository.port';
import {
  EmailChangeRequestRepository,
  EMAIL_CHANGE_REQUEST_REPOSITORY,
} from '@domain/ports/email-change-request.repository.port';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { EmailAlreadyInUseException } from '@domain/exceptions/email-already-in-use.exception';

/**
 * Aplica el cambio de email una vez confirmados ambos tokens (SPE-008).
 * Re-valida la unicidad para protegerse de una carrera entre solicitar y aplicar
 * (RN-002). Persiste el usuario con `update()` (por id, no por email) y marca la
 * solicitud como `applied`.
 */
@Injectable()
export class ApplyEmailChangeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_CHANGE_REQUEST_REPOSITORY)
    private readonly emailChangeRepository: EmailChangeRequestRepository,
  ) {}

  async execute(request: EmailChangeRequest): Promise<User> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new UserNotFoundException(request.userId);
    }

    // Re-validación de unicidad (otra cuenta pudo tomar el email en el intervalo).
    const existing = await this.userRepository.findByEmail(request.newEmail);
    if (existing && existing.id !== user.id) {
      await this.emailChangeRepository.save(request.withStatus('failed'));
      throw new EmailAlreadyInUseException(request.newEmail);
    }

    const updatedUser = new User(
      user.id,
      request.newEmail,
      user.name,
      user.password,
      user.role,
      user.createdAt,
    );
    await this.userRepository.update(updatedUser);
    await this.emailChangeRepository.save(request.withStatus('applied'));

    return updatedUser;
  }
}
