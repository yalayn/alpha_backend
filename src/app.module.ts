import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/controllers/UserController';
import { CreateUserUseCase } from './application/use-cases/CreateUser';
import { MongoUserRepository } from './infrastructure/persistence/MongoUserRepository';
import { USER_REPOSITORY } from './domain/ports/UserRepository';

@Module({
  imports: [],
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
