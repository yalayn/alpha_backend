import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDocument, SubscriptionSchema } from '../persistence/mongoose/schemas/subscription.schema';
import { MongooseSubscriptionRepository } from '../persistence/mongoose/repositories/mongoose-subscription.repository';
import { SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { SubscribeCustomerUseCase } from '@application/use-cases/subscribe-customer/subscribe-customer.use-case';
import { GetSubscriptionByIdUseCase } from '@application/use-cases/get-subscription-by-id/get-subscription-by-id.use-case';
import { GetCustomerSubscriptionUseCase } from '@application/use-cases/get-customer-subscription/get-customer-subscription.use-case';
import { ChangePlanUseCase } from '@application/use-cases/change-plan/change-plan.use-case';
import { PlanModule } from './plan.module';
import { SubscriptionController } from '../controllers/subscription.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubscriptionDocument.name, schema: SubscriptionSchema }]),
    forwardRef(() => PlanModule),
  ],
  controllers: [SubscriptionController],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MongooseSubscriptionRepository,
    },
    SubscribeCustomerUseCase,
    GetSubscriptionByIdUseCase,
    GetCustomerSubscriptionUseCase,
    ChangePlanUseCase,
  ],
  exports: [SUBSCRIPTION_REPOSITORY],
})
export class SubscriptionModule {}
