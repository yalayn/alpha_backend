import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePlanUseCase } from '@application/use-cases/create-plan/create-plan.use-case';
import { ListPlansUseCase } from '@application/use-cases/list-plans/list-plans.use-case';
import { GetPlanByIdUseCase } from '@application/use-cases/get-plan-by-id/get-plan-by-id.use-case';
import { CreatePlanHttpDto } from '../dtos/create-plan.http.dto';
import { PlanPresenter } from '../presenters/plan.presenter';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';

@ApiTags('Plans')
@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly listPlansUseCase: ListPlansUseCase,
    private readonly getPlanByIdUseCase: GetPlanByIdUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo plan de suscripción' })
  @ApiResponse({ status: 201, description: 'Plan creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'El nombre del plan ya existe.' })
  async create(@Body() body: CreatePlanHttpDto) {
    const result = await this.createPlanUseCase.execute(body);
    return PlanPresenter.toResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los planes disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de planes' })
  async listPlans() {
    const result = await this.listPlansUseCase.execute();
    return {
      data: result.map((p) => PlanPresenter.toResponse(p)),
      total: result.length,
    };
  }

  @Get(':planId')
  @ApiOperation({ summary: 'Obtener un plan por ID' })
  @ApiResponse({ status: 200, description: 'Plan encontrado' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  async getPlanById(@Param('planId') planId: string) {
    const result = await this.getPlanByIdUseCase.execute({ planId });
    return PlanPresenter.toResponse(result);
  }
}
