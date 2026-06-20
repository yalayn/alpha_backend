import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/ports/user.repository.port';
import { UserDocument } from '../schemas/user.schema';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<void> {
    const document = UserMapper.toPersistence(user);
    await this.userModel.findOneAndUpdate(
      { email: user.email },
      { $set: document },
      { upsert: true, returnDocument: 'after' },
    ).exec();
  }

  async update(user: User): Promise<void> {
    // Actualiza por _id (sin upsert). El _id es inmutable, así que se excluye
    // del $set — necesario para poder cambiar el email (SPE-008).
    const { _id, ...fields } = UserMapper.toPersistence(user);
    await this.userModel.findByIdAndUpdate(user.id, { $set: fields }).exec();
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).exec();
    if (!document) return null;
    return UserMapper.toDomain(document);
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({ email }).exec();
    if (!document) return null;
    return UserMapper.toDomain(document);
  }
}
