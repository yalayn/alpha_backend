import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscribeCustomerUseCase } from '@application/use-cases/subscribe-customer/subscribe-customer.use-case';
import { ValidateAccessUseCase } from '@application/use-cases/validate-access/validate-access.use-case';
import { SubscribeCustomerHttpDto } from '../dtos/subscribe-customer.http.dto';
import { ValidateAccessHttpDto } from '../dtos/validate-access.http.dto';
import { SubscriptionPresenter } from '../presenters/subscription.presenter';
import { AccessResultPresenter } from '../presenters/access-result.presenter';

@Controller()
export class SubscriptionController {
  constructor(
    private readonly subscribeCustomerUseCase: SubscribeCustomerUseCase,
    private readonly validateAccessUseCase: ValidateAccessUseCase,
  ) {}

  @Post('subscriptions')
  @HttpCode(HttpStatus.CREATED)
  async subscribe(@Body() body: SubscribeCustomerHttpDto) {
    const result = await this.subscribeCustomerUseCase.execute(body);
    return SubscriptionPresenter.toResponse(result);
  }

  @Post('access/validate')
  @HttpCode(HttpStatus.OK)
  async validateAccess(@Body() body: ValidateAccessHttpDto) {
    const result = await this.validateAccessUseCase.execute(body);
    return AccessResultPresenter.toResponse(result);
  }
}
