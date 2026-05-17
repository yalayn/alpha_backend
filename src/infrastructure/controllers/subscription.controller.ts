import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscribeCustomerUseCase } from '@application/use-cases/subscribe-customer/subscribe-customer.use-case';
import { ValidateAccessUseCase } from '@application/use-cases/validate-access/validate-access.use-case';
import { SubscribeCustomerHttpDto } from '../dtos/subscribe-customer.http.dto';
import { ValidateAccessHttpDto } from '../dtos/validate-access.http.dto';
import { SubscriptionPresenter } from '../presenters/subscription.presenter';
import { AccessResultPresenter } from '../presenters/access-result.presenter';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';

@ApiTags('Subscriptions', 'Access')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscribeCustomerUseCase: SubscribeCustomerUseCase,
    private readonly validateAccessUseCase: ValidateAccessUseCase,
  ) { }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Suscribir un cliente a un plan' })
  @ApiResponse({ status: 201, description: 'Suscripción creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'El cliente ya tiene una suscripción activa o datos inválidos.' })
  async subscribe(@Body() body: SubscribeCustomerHttpDto) {
    const result = await this.subscribeCustomerUseCase.execute(body);
    return SubscriptionPresenter.toResponse(result);
  }

  @Post('access/validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar si un cliente tiene acceso a una funcionalidad' })
  @ApiResponse({ status: 200, description: 'Validación realizada exitosamente.' })
  async validateAccess(@Body() body: ValidateAccessHttpDto) {
    const result = await this.validateAccessUseCase.execute(body);
    return AccessResultPresenter.toResponse(result);
  }
}
