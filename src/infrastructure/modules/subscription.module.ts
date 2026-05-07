import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDocument, SubscriptionSchema } from '../persistence/mongoose/schemas/subscription.schema';
import { MongooseSubscriptionRepository } from '../persistence/mongoose/repositories/mongoose-subscription.repository';
import { SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { SubscribeCustomerUseCase } from '@application/use-cases/subscribe-customer/subscribe-customer.use-case';
import { ValidateAccessUseCase } from '@application/use-cases/validate-access/validate-access.use-case';
import { PlanModule } from './plan.module';
import { SubscriptionController } from '../controllers/subscription.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubscriptionDocument.name, schema: SubscriptionSchema }]),
    PlanModule, // Necesitamos el PlanModule para acceder al PLAN_REPOSITORY
  ],
  controllers: [SubscriptionController],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MongooseSubscriptionRepository,
    },
    SubscribeCustomerUseCase,
    ValidateAccessUseCase,
  ],
})
export class SubscriptionModule {}
