export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'expired';

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly planId: string,
    public readonly paymentMethodId: string,
    public readonly status: SubscriptionStatus,
    public readonly startDate: Date,
    public readonly endDate?: Date,
    public readonly scheduledPlanId?: string,
  ) {}

  isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }
}
