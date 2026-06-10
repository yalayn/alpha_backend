import { Plan } from '../entities/Plan';

export interface IPlanRepository {
  save(plan: Plan): Promise<Plan>;
  findById(id: string): Promise<Plan | null>;
  findByName(name: string): Promise<Plan | null>;
  findAll(): Promise<Plan[]>;
  deleteById(id: string): Promise<Plan>;
}

export const PLAN_REPOSITORY = Symbol('IPlanRepository');
