import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository, USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { IAuthService, AUTH_SERVICE } from '../../../domain/ports/auth.service.port';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { LoginDto } from '../../dtos/login.dto';
import { AuthResponseDto } from '../../dtos/auth-response.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // 3. Generar token
    const accessToken = this.authService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // 4. Retornar respuesta
    return {
      accessToken,
      user,
    };
  }
}
