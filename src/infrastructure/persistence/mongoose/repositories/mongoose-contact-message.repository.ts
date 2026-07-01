import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactMessage } from '@domain/entities/contact-message.entity';
import { ContactMessageRepository } from '@domain/ports/contact-message.repository.port';
import { ContactMessageDocument } from '../schemas/contact-message.schema';
import { ContactMessageMapper } from '../mappers/contact-message.mapper';

@Injectable()
export class MongooseContactMessageRepository implements ContactMessageRepository {
  constructor(
    @InjectModel(ContactMessageDocument.name)
    private readonly model: Model<ContactMessageDocument>,
  ) {}

  async save(message: ContactMessage): Promise<void> {
    const persistence = ContactMessageMapper.toPersistence(message);
    await this.model
      .findOneAndUpdate({ id: message.id }, { $set: persistence }, { upsert: true, new: true })
      .exec();
  }

  async findAll(): Promise<ContactMessage[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).exec();
    return docs.map((doc) => ContactMessageMapper.toDomain(doc));
  }
}
