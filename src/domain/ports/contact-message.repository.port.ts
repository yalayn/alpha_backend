import { ContactMessage } from '../entities/contact-message.entity';

export interface ContactMessageRepository {
  /** Persiste un mensaje de contacto nuevo. */
  save(message: ContactMessage): Promise<void>;
  /** Devuelve todos los mensajes, del más reciente al más antiguo. */
  findAll(): Promise<ContactMessage[]>;
}

export const CONTACT_MESSAGE_REPOSITORY = Symbol('ContactMessageRepository');
