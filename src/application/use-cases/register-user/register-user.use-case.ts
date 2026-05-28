import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository, USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { RegisterUserDto } from '../../dtos/register-user.dto';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: RegisterUserDto): Promise<User> {
    // 1. Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(dto.email);
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Crear la entidad de dominio
    const user = new User(
      uuidv4(),
      dto.email,
      dto.name,
      hashedPassword,
      dto.role ?? 'customer',
    );

    // 4. Persistir
    await this.userRepository.save(user);

    return user;
  }
}
