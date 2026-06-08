import { Module } from '@nestjs/common';
import { ValidateAccessUseCase } from '@application/use-cases/validate-access/validate-access.use-case';
import { AccessController } from '../controllers/access.controller';
import { PlanModule } from './plan.module';
import { SubscriptionModule } from './subscription.module';

@Module({
  imports: [PlanModule, SubscriptionModule],
  controllers: [AccessController],
  providers: [ValidateAccessUseCase],
})
export class AccessModule {}
