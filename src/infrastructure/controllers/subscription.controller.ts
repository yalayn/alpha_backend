import { Controller, Post, Get, Patch, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscribeCustomerUseCase } from '@application/use-cases/subscribe-customer/subscribe-customer.use-case';
import { GetSubscriptionByIdUseCase } from '@application/use-cases/get-subscription-by-id/get-subscription-by-id.use-case';
import { GetCustomerSubscriptionUseCase } from '@application/use-cases/get-customer-subscription/get-customer-subscription.use-case';
import { ChangePlanUseCase } from '@application/use-cases/change-plan/change-plan.use-case';
import { SubscribeCustomerHttpDto } from '../dtos/subscribe-customer.http.dto';
import { ChangePlanHttpDto } from '../dtos/change-plan.http.dto';
import { SubscriptionPresenter } from '../presenters/subscription.presenter';
import { ChangePlanPresenter } from '../presenters/change-plan.presenter';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscribeCustomerUseCase: SubscribeCustomerUseCase,
    private readonly getSubscriptionByIdUseCase: GetSubscriptionByIdUseCase,
    private readonly getCustomerSubscriptionUseCase: GetCustomerSubscriptionUseCase,
    private readonly changePlanUseCase: ChangePlanUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Suscribir un cliente a un plan' })
  @ApiResponse({ status: 201, description: 'Suscripción creada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado.' })
  @ApiResponse({ status: 409, description: 'El cliente ya tiene una suscripción activa.' })
  @ApiResponse({ status: 422, description: 'Error al procesar el pago.' })
  async subscribe(@Body() body: SubscribeCustomerHttpDto) {
    const result = await this.subscribeCustomerUseCase.execute(body);
    return SubscriptionPresenter.toResponse(result);
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener la suscripción más reciente de un cliente' })
  @ApiResponse({ status: 200, description: 'Suscripción encontrada.' })
  @ApiResponse({ status: 404, description: 'El cliente no tiene ninguna suscripción.' })
  async getByCustomerId(@Param('customerId') customerId: string) {
    const result = await this.getCustomerSubscriptionUseCase.execute({ customerId });
    return SubscriptionPresenter.toResponse(result);
  }

  @Get(':subscriptionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una suscripción por ID' })
  @ApiResponse({ status: 200, description: 'Suscripción encontrada.' })
  @ApiResponse({ status: 404, description: 'Suscripción no encontrada.' })
  async getById(@Param('subscriptionId') subscriptionId: string) {
    const result = await this.getSubscriptionByIdUseCase.execute({ subscriptionId });
    return SubscriptionPresenter.toResponse(result);
  }

  @Patch(':subscriptionId/plan')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar el plan de una suscripción activa' })
  @ApiResponse({ status: 200, description: 'Plan cambiado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Suscripción o plan no encontrado.' })
  @ApiResponse({ status: 409, description: 'Suscripción no activa o mismo plan.' })
  @ApiResponse({ status: 422, description: 'Error al procesar el pago.' })
  async changePlan(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: ChangePlanHttpDto,
  ) {
    const result = await this.changePlanUseCase.execute({
      subscriptionId,
      newPlanId: body.newPlanId,
      paymentMethodId: body.paymentMethodId,
    });
    return ChangePlanPresenter.toResponse(result);
  }
}
