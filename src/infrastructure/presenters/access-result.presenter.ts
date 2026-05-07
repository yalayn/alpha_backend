import { AccessResult } from '@domain/entities/AccessResult';

export class AccessResultPresenter {
  static toResponse(result: AccessResult) {
    return {
      hasAccess: result.hasAccess,
      reason: result.reason,
      customerId: result.customerId,
      featureId: result.featureId,
      subscriptionStatus: result.subscriptionStatus,
    };
  }
}
