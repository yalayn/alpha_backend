export class PlanIntervalLockedException extends Error {
  constructor() {
    super('Cannot change interval of a plan with active subscriptions');
    this.name = 'PlanIntervalLockedException';
  }
}
