import { Subscription } from '@domain/entities/Subscription';

export class ChangePlanPresenter {
  static toResponse(subscription: Subscription) {
    const isScheduled = !!subscription.scheduledPlanId;
    return {
      id: subscription.id,
      customerId: subscription.customerId,
      planId: subscription.planId,
      paymentMethodId: subscription.paymentMethodId,
      status: subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate?.toISOString() ?? null,
      scheduledPlanId: subscription.scheduledPlanId ?? null,
      changeType: isScheduled ? 'scheduled' : 'immediate',
      effectiveDate: isScheduled
        ? subscription.endDate!.toISOString()
        : new Date().toISOString(),
    };
  }
}
