import { Controller, Get, Post, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUserUseCase } from '@application/use-cases/get-current-user/get-current-user.use-case';
import { UpdateProfileUseCase } from '@application/use-cases/update-profile/update-profile.use-case';
import { RequestEmailChangeUseCase } from '@application/use-cases/request-email-change/request-email-change.use-case';
import { GetEmailChangeStatusUseCase } from '@application/use-cases/get-email-change-status/get-email-change-status.use-case';
import { ConfirmEmailChangeUseCase } from '@application/use-cases/confirm-email-change/confirm-email-change.use-case';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';
import { CurrentUser } from '../adapters/auth/current-user.decorator';
import { UpdateProfileHttpDto } from '../dtos/update-profile.http.dto';
import { RequestEmailChangeHttpDto } from '../dtos/request-email-change.http.dto';
import { ConfirmEmailChangeHttpDto } from '../dtos/confirm-email-change.http.dto';
import { UserPresenter } from '../presenters/user.presenter';
import { EmailChangeStatusPresenter } from '../presenters/email-change-status.presenter';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly requestEmailChangeUseCase: RequestEmailChangeUseCase,
    private readonly getEmailChangeStatusUseCase: GetEmailChangeStatusUseCase,
    private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase,
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

  @Post('me/email-change')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicitar el cambio de email (doble verificación)' })
  @ApiResponse({ status: 202, description: 'Solicitud creada; correos de verificación enviados.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 409, description: 'El nuevo email ya está en uso.' })
  @ApiResponse({ status: 422, description: 'El nuevo email es igual al actual.' })
  async requestEmailChange(
    @CurrentUser('userId') userId: string,
    @Body() body: RequestEmailChangeHttpDto,
  ) {
    const request = await this.requestEmailChangeUseCase.execute({ userId, newEmail: body.newEmail });
    return EmailChangeStatusPresenter.toResponse(request);
  }

  @Get('me/email-change')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estado de la solicitud de cambio de email pendiente' })
  @ApiResponse({ status: 200, description: 'Estado de la solicitud pendiente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'No hay solicitud de cambio de email pendiente.' })
  async getEmailChangeStatus(@CurrentUser('userId') userId: string) {
    const request = await this.getEmailChangeStatusUseCase.execute(userId);
    return EmailChangeStatusPresenter.toResponse(request);
  }

  @Post('me/email-change/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar un token de cambio de email (público)' })
  @ApiResponse({ status: 200, description: 'Token confirmado; indica el lado y si se aplicó.' })
  @ApiResponse({ status: 400, description: 'Token inexistente o ya utilizado.' })
  @ApiResponse({ status: 409, description: 'El nuevo email fue tomado por otra cuenta.' })
  @ApiResponse({ status: 410, description: 'El token expiró.' })
  async confirmEmailChange(@Body() body: ConfirmEmailChangeHttpDto) {
    return this.confirmEmailChangeUseCase.execute({ token: body.token });
  }
}
