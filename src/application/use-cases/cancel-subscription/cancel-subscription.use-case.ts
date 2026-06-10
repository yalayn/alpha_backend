import { Inject } from '@nestjs/common';
import { Subscription } from '@domain/entities/Subscription';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { SubscriptionAlreadyCanceledException } from '@domain/exceptions/subscription-already-canceled.exception';
import { CancelSubscriptionDto } from '@application/dtos/cancel-subscription.dto';

export class CancelSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: CancelSubscriptionDto): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(dto.subscriptionId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(dto.subscriptionId);
    }

    if (subscription.status === 'canceled') {
      throw new SubscriptionAlreadyCanceledException(dto.subscriptionId);
    }

    const canceled = new Subscription(
      subscription.id,
      subscription.customerId,
      subscription.planId,
      subscription.paymentMethodId,
      'canceled',
      subscription.startDate,
      subscription.endDate,
      subscription.scheduledPlanId,
    );

    return this.subscriptionRepository.save(canceled);
  }
}
