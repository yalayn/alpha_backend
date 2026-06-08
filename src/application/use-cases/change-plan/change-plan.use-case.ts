import { Inject } from '@nestjs/common';
import { Subscription } from '@domain/entities/Subscription';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { SubscriptionNotActiveException } from '@domain/exceptions/subscription-not-active.exception';
import { SamePlanChangeException } from '@domain/exceptions/same-plan-change.exception';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { ChangePlanDto } from '@application/dtos/change-plan.dto';

export class ChangePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: ChangePlanDto): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(dto.subscriptionId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(dto.subscriptionId);
    }

    if (subscription.status !== 'active') {
      throw new SubscriptionNotActiveException(dto.subscriptionId);
    }

    if (subscription.planId === dto.newPlanId) {
      throw new SamePlanChangeException(dto.newPlanId);
    }

    const newPlan = await this.planRepository.findById(dto.newPlanId);
    if (!newPlan) {
      throw new PlanNotFoundException(dto.newPlanId);
    }

    const currentPlan = await this.planRepository.findById(subscription.planId);

    const isScheduled = currentPlan?.interval === 'year' && newPlan.interval === 'month';

    const updated = isScheduled
      ? new Subscription(
          subscription.id,
          subscription.customerId,
          subscription.planId,
          subscription.paymentMethodId,
          subscription.status,
          subscription.startDate,
          subscription.endDate,
          dto.newPlanId,
        )
      : new Subscription(
          subscription.id,
          subscription.customerId,
          dto.newPlanId,
          dto.paymentMethodId,
          subscription.status,
          subscription.startDate,
          subscription.endDate,
          undefined,
        );

    return this.subscriptionRepository.save(updated);
  }
}
