import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../persistence/mongoose/schemas/user.schema';
import { MongooseUserRepository } from '../persistence/mongoose/repositories/mongoose-user.repository';
import { USER_REPOSITORY } from '@domain/ports/user.repository.port';
import { UserController } from '../controllers/user.controller';
import { GetCurrentUserUseCase } from '@application/use-cases/get-current-user/get-current-user.use-case';
import { UpdateProfileUseCase } from '@application/use-cases/update-profile/update-profile.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepository,
    },
    GetCurrentUserUseCase,
    UpdateProfileUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
