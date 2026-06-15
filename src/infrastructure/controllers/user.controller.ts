import { Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUserUseCase } from '@application/use-cases/get-current-user/get-current-user.use-case';
import { UpdateProfileUseCase } from '@application/use-cases/update-profile/update-profile.use-case';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';
import { CurrentUser } from '../adapters/auth/current-user.decorator';
import { UpdateProfileHttpDto } from '../dtos/update-profile.http.dto';
import { UserPresenter } from '../presenters/user.presenter';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consultar el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'El usuario del token ya no existe.' })
  async getMe(@CurrentUser('userId') userId: string) {
    const user = await this.getCurrentUserUseCase.execute(userId);
    return UserPresenter.toResponse(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'El usuario del token ya no existe.' })
  async updateMe(
    @CurrentUser('userId') userId: string,
    @Body() body: UpdateProfileHttpDto,
  ) {
    const user = await this.updateProfileUseCase.execute({ userId, name: body.name });
    return UserPresenter.toResponse(user);
  }
}
