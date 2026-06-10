import { Controller, Post, Get, Patch, Delete, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePlanUseCase } from '@application/use-cases/create-plan/create-plan.use-case';
import { ListPlansUseCase } from '@application/use-cases/list-plans/list-plans.use-case';
import { GetPlanByIdUseCase } from '@application/use-cases/get-plan-by-id/get-plan-by-id.use-case';
import { UpdatePlanUseCase } from '@application/use-cases/update-plan/update-plan.use-case';
import { DeletePlanUseCase } from '@application/use-cases/delete-plan/delete-plan.use-case';
import { CreatePlanHttpDto } from '../dtos/create-plan.http.dto';
import { UpdatePlanHttpDto } from '../dtos/update-plan.http.dto';
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
    private readonly updatePlanUseCase: UpdatePlanUseCase,
    private readonly deletePlanUseCase: DeletePlanUseCase,
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

  @Patch(':planId')
  @ApiOperation({ summary: 'Editar un plan existente (actualización parcial)' })
  @ApiResponse({ status: 200, description: 'Plan actualizado' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado o intervalo bloqueado' })
  async updatePlan(@Param('planId') planId: string, @Body() body: UpdatePlanHttpDto) {
    const result = await this.updatePlanUseCase.execute({ planId, ...body });
    return PlanPresenter.toResponse(result);
  }

  @Delete(':planId')
  @ApiOperation({ summary: 'Eliminar un plan sin suscripciones activas' })
  @ApiResponse({ status: 200, description: 'Plan eliminado' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  @ApiResponse({ status: 409, description: 'El plan tiene suscripciones activas' })
  async deletePlan(@Param('planId') planId: string) {
    const result = await this.deletePlanUseCase.execute({ planId });
    return PlanPresenter.toResponse(result);
  }
}
