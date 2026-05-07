import { Inject } from '@nestjs/common';
import { Plan } from '@domain/entities/Plan';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { PlanAlreadyExistsException } from '@domain/exceptions/plan-already-exists.exception';
import { CreatePlanDto } from '@application/dtos/create-plan.dto';
import * as crypto from 'crypto';

export class CreatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(dto: CreatePlanDto): Promise<Plan> {
    const existing = await this.planRepository.findByName(dto.name);
    if (existing) {
      throw new PlanAlreadyExistsException(dto.name);
    }

    const plan = new Plan(
      crypto.randomUUID(),
      dto.name,
      dto.price,
      dto.currency,
      dto.interval,
      dto.features,
      new Date(),
    );

    return this.planRepository.save(plan);
  }
}
