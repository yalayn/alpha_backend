import { Inject, Injectable } from '@nestjs/common';
import { ContactMessage } from '../../../domain/entities/contact-message.entity';
import {
  ContactMessageRepository,
  CONTACT_MESSAGE_REPOSITORY,
} from '../../../domain/ports/contact-message.repository.port';

@Injectable()
export class ListContactMessagesUseCase {
  constructor(
    @Inject(CONTACT_MESSAGE_REPOSITORY)
    private readonly contactMessageRepository: ContactMessageRepository,
  ) {}

  /** Devuelve todos los mensajes, del más reciente al más antiguo. */
  async execute(): Promise<ContactMessage[]> {
    return this.contactMessageRepository.findAll();
  }
}
