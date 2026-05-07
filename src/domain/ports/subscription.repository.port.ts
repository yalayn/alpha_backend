import { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  findByCustomerId(customerId: string): Promise<Subscription | null>;
  findActiveByCustomerId(customerId: string): Promise<Subscription | null>;
  findAll(): Promise<Subscription[]>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('ISubscriptionRepository');
