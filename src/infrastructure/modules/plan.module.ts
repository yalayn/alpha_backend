import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanDocument, PlanSchema } from '../persistence/mongoose/schemas/plan.schema';
import { MongoosePlanRepository } from '../persistence/mongoose/repositories/mongoose-plan.repository';
import { PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { CreatePlanUseCase } from '@application/use-cases/create-plan/create-plan.use-case';
import { ListPlansUseCase } from '@application/use-cases/list-plans/list-plans.use-case';
import { GetPlanByIdUseCase } from '@application/use-cases/get-plan-by-id/get-plan-by-id.use-case';
import { UpdatePlanUseCase } from '@application/use-cases/update-plan/update-plan.use-case';
import { DeletePlanUseCase } from '@application/use-cases/delete-plan/delete-plan.use-case';
import { PlanController } from '../controllers/plan.controller';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlanDocument.name, schema: PlanSchema }]),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [PlanController],
  providers: [
    {
      provide: PLAN_REPOSITORY,
      useClass: MongoosePlanRepository,
    },
    CreatePlanUseCase,
    ListPlansUseCase,
    GetPlanByIdUseCase,
    UpdatePlanUseCase,
    DeletePlanUseCase,
  ],
  exports: [PLAN_REPOSITORY],
})
export class PlanModule {}
