import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateContactMessageUseCase } from '@application/use-cases/create-contact-message/create-contact-message.use-case';
import { ListContactMessagesUseCase } from '@application/use-cases/list-contact-messages/list-contact-messages.use-case';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';
import { RolesGuard } from '../adapters/auth/roles.guard';
import { Roles } from '../adapters/auth/roles.decorator';
import { CurrentUser } from '../adapters/auth/current-user.decorator';
import { CreateContactMessageHttpDto } from '../dtos/create-contact-message.http.dto';
import { ContactMessagePresenter } from '../presenters/contact-message.presenter';

@ApiTags('Contact')
@ApiBearerAuth()
@Controller('contact-messages')
export class ContactController {
  constructor(
    private readonly createContactMessageUseCase: CreateContactMessageUseCase,
    private readonly listContactMessagesUseCase: ListContactMessagesUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un comentario o solicitud de contacto' })
  @ApiResponse({ status: 201, description: 'Mensaje de contacto registrado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() body: CreateContactMessageHttpDto,
  ) {
    const message = await this.createContactMessageUseCase.execute({
      senderId: userId,
      type: body.type,
      subject: body.subject,
      message: body.message,
    });
    return ContactMessagePresenter.toResponse(message);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos los mensajes de contacto (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes (más reciente primero).' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente (requiere admin).' })
  async list() {
    const messages = await this.listContactMessagesUseCase.execute();
    return messages.map((m) => ContactMessagePresenter.toResponse(m));
  }
}
