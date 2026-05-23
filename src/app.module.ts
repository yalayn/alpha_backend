import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanModule } from './infrastructure/modules/plan.module';
import { SubscriptionModule } from './infrastructure/modules/subscription.module';
import { UserModule } from './infrastructure/modules/user.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { HealthModule } from './infrastructure/modules/health.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://mongo:27017/project_alpha'),
    PlanModule,
    SubscriptionModule,
    UserModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
