export class SamePlanChangeException extends Error {
  constructor(planId: string) {
    super(`Subscription is already on plan "${planId}"`);
    this.name = 'SamePlanChangeException';
  }
}
