import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository, USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { UpdateProfileDto } from '../../dtos/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: UpdateProfileDto): Promise<User> {
    // 1. El usuario debe existir (identidad desde el JWT)
    const existing = await this.userRepository.findById(dto.userId);
    if (!existing) {
      throw new UserNotFoundException(dto.userId);
    }

    // 2. La entidad es inmutable: se construye una nueva preservando
    //    email, password, role y createdAt — solo cambia el name.
    //    El email NO se modifica en esta feature (ver SPE-008).
    const updated = new User(
      existing.id,
      existing.email,
      dto.name,
      existing.password,
      existing.role,
      existing.createdAt,
    );

    // 3. Persistir. Como el email no cambia, el save() del repositorio
    //    (que busca por email) encuentra el documento y lo actualiza.
    await this.userRepository.save(updated);

    return updated;
  }
}
