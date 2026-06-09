export class PlanHasActiveSubscriptionsException extends Error {
  constructor(planName: string) {
    super(`Plan "${planName}" has active subscriptions and cannot be deleted`);
    this.name = 'PlanHasActiveSubscriptionsException';
  }
}
