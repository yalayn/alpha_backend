import { ContactMessage } from '@domain/entities/contact-message.entity';

export class ContactMessagePresenter {
  static toResponse(message: ContactMessage) {
    return {
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      type: message.type,
      subject: message.subject,
      message: message.message,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
