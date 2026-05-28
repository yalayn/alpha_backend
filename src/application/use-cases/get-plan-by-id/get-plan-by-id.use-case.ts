import { Inject } from '@nestjs/common';
import { Plan } from '@domain/entities/Plan';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { GetPlanByIdDto } from '@application/dtos/get-plan-by-id.dto';

export class GetPlanByIdUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(dto: GetPlanByIdDto): Promise<Plan> {
    const plan = await this.planRepository.findById(dto.planId);
    if (!plan) {
      throw new PlanNotFoundException(dto.planId);
    }
    return plan;
  }
}
