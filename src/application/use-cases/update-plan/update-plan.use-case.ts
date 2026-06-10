import { Inject } from '@nestjs/common';
import { Plan } from '@domain/entities/Plan';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { PlanAlreadyExistsException } from '@domain/exceptions/plan-already-exists.exception';
import { PlanIntervalLockedException } from '@domain/exceptions/plan-interval-locked.exception';
import { UpdatePlanDto } from '@application/dtos/update-plan.dto';

export class UpdatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: UpdatePlanDto): Promise<Plan> {
    const existing = await this.planRepository.findById(dto.planId);
    if (!existing) {
      throw new PlanNotFoundException(dto.planId);
    }

    // RN-002: nombre duplicado
    if (dto.name && dto.name !== existing.name) {
      const nameConflict = await this.planRepository.findByName(dto.name);
      if (nameConflict) {
        throw new PlanAlreadyExistsException(dto.name);
      }
    }

    // RN-004: interval bloqueado si hay suscripciones activas
    if (dto.interval && dto.interval !== existing.interval) {
      const activeSubscriptions = await this.subscriptionRepository.findActiveByPlanId(dto.planId);
      if (activeSubscriptions.length > 0) {
        throw new PlanIntervalLockedException();
      }
    }

    const updated = new Plan(
      existing.id,
      dto.name ?? existing.name,
      dto.price ?? existing.price,
      dto.currency ?? existing.currency,
      dto.interval ?? existing.interval,
      dto.features ?? existing.features,
      existing.createdAt,
    );

    return this.planRepository.save(updated);
  }
}
