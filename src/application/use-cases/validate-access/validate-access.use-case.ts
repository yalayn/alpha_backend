import { Inject } from '@nestjs/common';
import { AccessResult } from '@domain/entities/AccessResult';
import { IPlanRepository, PLAN_REPOSITORY } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { ValidateAccessDto } from '@application/dtos/validate-access.dto';

export class ValidateAccessUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: ValidateAccessDto): Promise<AccessResult> {
    // 1. Buscar la suscripción activa
    const subscription = await this.subscriptionRepository.findActiveByCustomerId(dto.customerId);

    // 2. Si no hay suscripción activa
    if (!subscription) {
      return new AccessResult(
        false, 
        'no_active_subscription', 
        dto.customerId, 
        dto.featureId, 
        null
      );
    }

    // 3. Verificar si está expirada
    if (subscription.isExpired()) {
      return new AccessResult(
        false, 
        'subscription_expired', 
        dto.customerId, 
        dto.featureId, 
        'expired'
      );
    }

    // 4. Verificar si el plan incluye la funcionalidad
    const plan = await this.planRepository.findById(subscription.planId);
    if (!plan || !plan.hasFeature(dto.featureId)) {
      return new AccessResult(
        false, 
        'feature_not_in_plan', 
        dto.customerId, 
        dto.featureId, 
        subscription.status
      );
    }

    // 5. Acceso concedido
    return new AccessResult(
      true, 
      null, 
      dto.customerId, 
      dto.featureId, 
      subscription.status
    );
  }
}
