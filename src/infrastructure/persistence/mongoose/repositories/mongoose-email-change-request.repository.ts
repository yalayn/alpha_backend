import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import { EmailChangeRequestRepository } from '@domain/ports/email-change-request.repository.port';
import { EmailChangeRequestDocument } from '../schemas/email-change-request.schema';
import { EmailChangeRequestMapper } from '../mappers/email-change-request.mapper';

@Injectable()
export class MongooseEmailChangeRequestRepository implements EmailChangeRequestRepository {
  constructor(
    @InjectModel(EmailChangeRequestDocument.name)
    private readonly model: Model<EmailChangeRequestDocument>,
  ) {}

  async save(request: EmailChangeRequest): Promise<void> {
    const persistence = EmailChangeRequestMapper.toPersistence(request);
    await this.model
      .findOneAndUpdate({ id: request.id }, { $set: persistence }, { upsert: true, new: true })
      .exec();
  }

  async findPendingByUserId(userId: string): Promise<EmailChangeRequest | null> {
    const doc = await this.model.findOne({ userId, status: 'pending' }).exec();
    return doc ? EmailChangeRequestMapper.toDomain(doc) : null;
  }

  async findPendingByTokenHash(tokenHash: string): Promise<EmailChangeRequest | null> {
    const doc = await this.model
      .findOne({
        status: 'pending',
        $or: [{ oldTokenHash: tokenHash }, { newTokenHash: tokenHash }],
      })
      .exec();
    return doc ? EmailChangeRequestMapper.toDomain(doc) : null;
  }

  async deletePendingByUserId(userId: string): Promise<void> {
    await this.model.deleteMany({ userId, status: 'pending' }).exec();
  }
}
