import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../persistence/mongoose/schemas/user.schema';
import {
  EmailChangeRequestDocument,
  EmailChangeRequestSchema,
} from '../persistence/mongoose/schemas/email-change-request.schema';
import { MongooseUserRepository } from '../persistence/mongoose/repositories/mongoose-user.repository';
import { MongooseEmailChangeRequestRepository } from '../persistence/mongoose/repositories/mongoose-email-change-request.repository';
import { USER_REPOSITORY } from '@domain/ports/user.repository.port';
import { EMAIL_CHANGE_REQUEST_REPOSITORY } from '@domain/ports/email-change-request.repository.port';
import { EMAIL_SENDER } from '@domain/ports/email-sender.port';
import { NodemailerEmailSender } from '../adapters/email/nodemailer-email-sender';
import { UserController } from '../controllers/user.controller';
import { GetCurrentUserUseCase } from '@application/use-cases/get-current-user/get-current-user.use-case';
import { UpdateProfileUseCase } from '@application/use-cases/update-profile/update-profile.use-case';
import {
  RequestEmailChangeUseCase,
  EMAIL_CHANGE_APP_URL,
} from '@application/use-cases/request-email-change/request-email-change.use-case';
import { ApplyEmailChangeUseCase } from '@application/use-cases/apply-email-change/apply-email-change.use-case';
import { ConfirmEmailChangeUseCase } from '@application/use-cases/confirm-email-change/confirm-email-change.use-case';
import { GetEmailChangeStatusUseCase } from '@application/use-cases/get-email-change-status/get-email-change-status.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: EmailChangeRequestDocument.name, schema: EmailChangeRequestSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepository,
    },
    {
      provide: EMAIL_CHANGE_REQUEST_REPOSITORY,
      useClass: MongooseEmailChangeRequestRepository,
    },
    {
      provide: EMAIL_SENDER,
      useClass: NodemailerEmailSender,
    },
    {
      provide: EMAIL_CHANGE_APP_URL,
      useValue: process.env.APP_BASE_URL || 'http://localhost:5173',
    },
    GetCurrentUserUseCase,
    UpdateProfileUseCase,
    RequestEmailChangeUseCase,
    ApplyEmailChangeUseCase,
    ConfirmEmailChangeUseCase,
    GetEmailChangeStatusUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
