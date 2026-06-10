import { Inject } from '@nestjs/common';
import { Plan } from '@domain/entities/Plan';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { PlanHasActiveSubscriptionsException } from '@domain/exceptions/plan-has-active-subscriptions.exception';
import { DeletePlanDto } from '@application/dtos/delete-plan.dto';

export class DeletePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: DeletePlanDto): Promise<Plan> {
    const existing = await this.planRepository.findById(dto.planId);
    if (!existing) {
      throw new PlanNotFoundException(dto.planId);
    }

    // RN-001: solo eliminar si no tiene suscripciones activas
    const activeSubscriptions = await this.subscriptionRepository.findActiveByPlanId(dto.planId);
    if (activeSubscriptions.length > 0) {
      throw new PlanHasActiveSubscriptionsException(existing.name);
    }

    return this.planRepository.deleteById(dto.planId);
  }
}
