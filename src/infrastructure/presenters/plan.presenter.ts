import { Plan } from '@domain/entities/Plan';

export class PlanPresenter {
  static toResponse(plan: Plan) {
    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      createdAt: plan.createdAt.toISOString(),
    };
  }
}
