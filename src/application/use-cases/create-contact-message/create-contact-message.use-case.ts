import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ContactMessage,
  ContactMessageType,
} from '../../../domain/entities/contact-message.entity';
import {
  ContactMessageRepository,
  CONTACT_MESSAGE_REPOSITORY,
} from '../../../domain/ports/contact-message.repository.port';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/ports/user.repository.port';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';

export interface CreateContactMessageInput {
  senderId: string;
  type: ContactMessageType;
  subject: string;
  message: string;
}

@Injectable()
export class CreateContactMessageUseCase {
  constructor(
    @Inject(CONTACT_MESSAGE_REPOSITORY)
    private readonly contactMessageRepository: ContactMessageRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateContactMessageInput): Promise<ContactMessage> {
    // Snapshot del remitente: se carga el usuario del JWT y se congelan su
    // nombre y email en el mensaje (RN-001).
    const sender = await this.userRepository.findById(input.senderId);
    if (!sender) {
      throw new UserNotFoundException(input.senderId);
    }

    const message = new ContactMessage(
      uuidv4(),
      sender.id,
      sender.name,
      sender.email,
      input.type,
      input.subject,
      input.message,
      new Date(),
    );

    await this.contactMessageRepository.save(message);
    return message;
  }
}
