import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserUseCase } from '@application/use-cases/register-user/register-user.use-case';
import { LoginUseCase } from '@application/use-cases/login/login.use-case';
import { RegisterUserDto } from '@application/dtos/register-user.dto';
import { RegisterUserHttpDto } from '../dtos/register-user.http.dto';
import { LoginHttpDto } from '../dtos/login.http.dto';
import { UserPresenter } from '../presenters/user.presenter';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos.' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso.' })
  async register(@Body() body: RegisterUserHttpDto) {
    const dto = new RegisterUserDto(body.email, body.password, body.name, body.role);
    const user = await this.registerUserUseCase.execute(dto);
    return UserPresenter.toResponse(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() body: LoginHttpDto) {
    const result = await this.loginUseCase.execute(body);
    return {
      accessToken: result.accessToken,
      user: UserPresenter.toResponse(result.user),
    };
  }
}
