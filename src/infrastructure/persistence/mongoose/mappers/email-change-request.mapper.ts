import {
  EmailChangeRequest,
  EmailChangeStatus,
} from '@domain/entities/email-change-request.entity';
import { EmailChangeRequestDocument } from '../schemas/email-change-request.schema';

export class EmailChangeRequestMapper {
  static toDomain(doc: EmailChangeRequestDocument): EmailChangeRequest {
    return new EmailChangeRequest(
      doc.id,
      doc.userId,
      doc.newEmail,
      doc.oldTokenHash,
      doc.newTokenHash,
      doc.status as EmailChangeStatus,
      doc.createdAt,
      doc.expiresAt,
      doc.oldConfirmedAt ?? undefined,
      doc.newConfirmedAt ?? undefined,
    );
  }

  static toPersistence(request: EmailChangeRequest) {
    return {
      id: request.id,
      userId: request.userId,
      newEmail: request.newEmail,
      oldTokenHash: request.oldTokenHash,
      newTokenHash: request.newTokenHash,
      status: request.status,
      createdAt: request.createdAt,
      expiresAt: request.expiresAt,
      oldConfirmedAt: request.oldConfirmedAt,
      newConfirmedAt: request.newConfirmedAt,
    };
  }
}
