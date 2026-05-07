import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreatePlanUseCase } from '@application/use-cases/create-plan/create-plan.use-case';
import { CreatePlanHttpDto } from '../dtos/create-plan.http.dto';
import { PlanPresenter } from '../presenters/plan.presenter';

@Controller('plans')
export class PlanController {
  constructor(private readonly createPlanUseCase: CreatePlanUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreatePlanHttpDto) {
    const result = await this.createPlanUseCase.execute(body);
    return PlanPresenter.toResponse(result);
  }
}
