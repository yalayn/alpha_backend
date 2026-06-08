import { Inject } from '@nestjs/common';
import { Subscription } from '@domain/entities/Subscription';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { GetSubscriptionByIdDto } from '@application/dtos/get-subscription-by-id.dto';

export class GetSubscriptionByIdUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: GetSubscriptionByIdDto): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(dto.subscriptionId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(dto.subscriptionId);
    }
    return subscription;
  }
}
