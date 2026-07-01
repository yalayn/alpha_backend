import {
  ContactMessage,
  ContactMessageType,
} from '@domain/entities/contact-message.entity';
import { ContactMessageDocument } from '../schemas/contact-message.schema';

export class ContactMessageMapper {
  static toDomain(doc: ContactMessageDocument): ContactMessage {
    return new ContactMessage(
      doc.id,
      doc.senderId,
      doc.senderName,
      doc.senderEmail,
      doc.type as ContactMessageType,
      doc.subject,
      doc.message,
      doc.createdAt,
    );
  }

  static toPersistence(message: ContactMessage) {
    return {
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      type: message.type,
      subject: message.subject,
      message: message.message,
      createdAt: message.createdAt,
    };
  }
}
