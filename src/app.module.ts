import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanModule } from './infrastructure/modules/plan.module';
import { SubscriptionModule } from './infrastructure/modules/subscription.module';
import { UserController } from './infrastructure/controllers/UserController';
import { CreateUserUseCase } from './application/use-cases/CreateUser';
import { MongoUserRepository } from './infrastructure/persistence/MongoUserRepository';
import { USER_REPOSITORY } from './domain/ports/UserRepository';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/alpha_db'),
    PlanModule,
    SubscriptionModule,
  ],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
  ],
})
export class AppModule {}
