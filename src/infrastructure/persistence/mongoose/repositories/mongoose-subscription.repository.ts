import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '@domain/entities/Subscription';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { SubscriptionDocument } from '../schemas/subscription.schema';
import { SubscriptionMapper } from '../mappers/subscription.mapper';

@Injectable()
export class MongooseSubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectModel(SubscriptionDocument.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async save(subscription: Subscription): Promise<Subscription> {
    const persistence = SubscriptionMapper.toPersistence(subscription);
    const doc = await this.subscriptionModel.findOneAndUpdate(
      { id: subscription.id },
      { $set: persistence },
      { upsert: true, new: true },
    ).exec();
    return SubscriptionMapper.toDomain(doc!);
  }

  async findById(id: string): Promise<Subscription | null> {
    const doc = await this.subscriptionModel.findOne({ id }).exec();
    return doc ? SubscriptionMapper.toDomain(doc) : null;
  }

  async findByCustomerId(customerId: string): Promise<Subscription | null> {
    const doc = await this.subscriptionModel.findOne({ customerId }).exec();
    return doc ? SubscriptionMapper.toDomain(doc) : null;
  }

  async findActiveByCustomerId(customerId: string): Promise<Subscription | null> {
    const doc = await this.subscriptionModel.findOne({ 
      customerId, 
      status: 'active' 
    }).exec();
    return doc ? SubscriptionMapper.toDomain(doc) : null;
  }

  async findActiveByPlanId(planId: string): Promise<Subscription[]> {
    const docs = await this.subscriptionModel.find({
      planId,
      status: 'active',
    }).exec();
    return docs.map(SubscriptionMapper.toDomain);
  }

  async findAll(): Promise<Subscription[]> {
    const docs = await this.subscriptionModel.find().exec();
    return docs.map(SubscriptionMapper.toDomain);
  }
}
