  import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from '@domain/entities/Plan';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { PlanDocument } from '../schemas/plan.schema';
import { PlanMapper } from '../mappers/plan.mapper';

@Injectable()
export class MongoosePlanRepository implements IPlanRepository {
  constructor(
    @InjectModel(PlanDocument.name)
    private readonly planModel: Model<PlanDocument>,
  ) {}

  async save(plan: Plan): Promise<Plan> {
    const persistence = PlanMapper.toPersistence(plan);
    const doc = await this.planModel.findOneAndUpdate(
      { id: plan.id },
      { $set: persistence },
      { upsert: true, new: true },
    ).exec();
    return PlanMapper.toDomain(doc!);
  }

  async findById(id: string): Promise<Plan | null> {
    const doc = await this.planModel.findOne({ id }).exec();
    return doc ? PlanMapper.toDomain(doc) : null;
  }

  async findByName(name: string): Promise<Plan | null> {
    const doc = await this.planModel.findOne({ name }).exec();
    return doc ? PlanMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<Plan[]> {
    const docs = await this.planModel.find().exec();
    return docs.map(PlanMapper.toDomain);
  }

  async deleteById(id: string): Promise<Plan> {
    const doc = await this.planModel.findOneAndDelete({ id }).exec();
    return PlanMapper.toDomain(doc!);
  }
}
