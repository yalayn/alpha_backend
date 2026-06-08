import { Subscription, SubscriptionStatus } from '@domain/entities/Subscription';
import { SubscriptionDocument } from '../schemas/subscription.schema';

export class SubscriptionMapper {
  static toDomain(doc: SubscriptionDocument): Subscription {
    return new Subscription(
      doc.id,
      doc.customerId,
      doc.planId,
      doc.paymentMethodId,
      doc.status as SubscriptionStatus,
      doc.startDate,
      doc.endDate,
      doc.scheduledPlanId,
    );
  }

  static toPersistence(entity: Subscription): Partial<SubscriptionDocument> {
    return {
      id: entity.id,
      customerId: entity.customerId,
      planId: entity.planId,
      paymentMethodId: entity.paymentMethodId,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      scheduledPlanId: entity.scheduledPlanId,
    };
  }
}
