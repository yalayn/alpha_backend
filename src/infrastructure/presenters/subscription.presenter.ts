import { Subscription } from '@domain/entities/Subscription';

export class SubscriptionPresenter {
  static toResponse(subscription: Subscription) {
    return {
      id: subscription.id,
      customerId: subscription.customerId,
      planId: subscription.planId,
      paymentMethodId: subscription.paymentMethodId,
      status: subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate?.toISOString() || null,
    };
  }
}
