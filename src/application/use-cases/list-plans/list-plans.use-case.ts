import { Inject } from '@nestjs/common';
import { Plan } from '@domain/entities/Plan';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';

export class ListPlansUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(): Promise<Plan[]> {
    return this.planRepository.findAll();
  }
}
