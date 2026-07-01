import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContactMessageDocument,
  ContactMessageSchema,
} from '../persistence/mongoose/schemas/contact-message.schema';
import { MongooseContactMessageRepository } from '../persistence/mongoose/repositories/mongoose-contact-message.repository';
import { CONTACT_MESSAGE_REPOSITORY } from '@domain/ports/contact-message.repository.port';
import { ContactController } from '../controllers/contact.controller';
import { CreateContactMessageUseCase } from '@application/use-cases/create-contact-message/create-contact-message.use-case';
import { ListContactMessagesUseCase } from '@application/use-cases/list-contact-messages/list-contact-messages.use-case';
import { UserModule } from './user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessageDocument.name, schema: ContactMessageSchema },
    ]),
    // UserModule exporta USER_REPOSITORY, que el CreateContactMessageUseCase
    // usa para cargar el remitente y hacer el snapshot (RN-001).
    UserModule,
  ],
  controllers: [ContactController],
  providers: [
    {
      provide: CONTACT_MESSAGE_REPOSITORY,
      useClass: MongooseContactMessageRepository,
    },
    CreateContactMessageUseCase,
    ListContactMessagesUseCase,
  ],
})
export class ContactModule {}
