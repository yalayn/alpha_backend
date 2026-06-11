import { Inject } from '@nestjs/common';
import { Subscription } from '@domain/entities/Subscription';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { SubscriptionAlreadyActiveException } from '@domain/exceptions/subscription-already-active.exception';
import { SubscribeCustomerDto } from '@application/dtos/subscribe-customer.dto';
import * as crypto from 'crypto';

export class SubscribeCustomerUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: SubscribeCustomerDto): Promise<Subscription> {
    const plan = await this.planRepository.findById(dto.planId);
    if (!plan) {
      throw new PlanNotFoundException(dto.planId);
    }

    const recentSubscription = await this.subscriptionRepository.findByCustomerId(dto.customerId);
    if (recentSubscription?.status === 'active') {
      throw new SubscriptionAlreadyActiveException(dto.customerId);
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan.interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = new Subscription(
      crypto.randomUUID(),
      dto.customerId,
      dto.planId,
      dto.paymentMethodId,
      'active',
      startDate,
      endDate,
    );

    return this.subscriptionRepository.save(subscription);
  }
}
