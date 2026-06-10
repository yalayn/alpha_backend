import { Inject } from '@nestjs/common';
import { Subscription } from '@domain/entities/Subscription';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@domain/ports/subscription.repository.port';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { GetCustomerSubscriptionDto } from '@application/dtos/get-customer-subscription.dto';

export class GetCustomerSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(dto: GetCustomerSubscriptionDto): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByCustomerId(dto.customerId);
    if (!subscription) {
      throw new SubscriptionNotFoundException(dto.customerId);
    }
    return subscription;
  }
}
