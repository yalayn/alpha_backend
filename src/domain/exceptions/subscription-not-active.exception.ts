export class SubscriptionNotActiveException extends Error {
  constructor(subscriptionId: string) {
    super(`Subscription "${subscriptionId}" is not active`);
    this.name = 'SubscriptionNotActiveException';
  }
}
