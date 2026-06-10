import { GetCustomerSubscriptionUseCase } from './get-customer-subscription.use-case';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Subscription } from '@domain/entities/Subscription';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';

describe('GetCustomerSubscriptionUseCase', () => {
  let useCase: GetCustomerSubscriptionUseCase;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const mockSubscription = new Subscription(
    'sub-1',
    'cust-1',
    'plan-1',
    'pm-1',
    'active',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    mockSubscriptionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findActiveByCustomerId: jest.fn(),
      findActiveByPlanId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new GetCustomerSubscriptionUseCase(mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should return the subscription when the customer has one', async () => {
      mockSubscriptionRepository.findByCustomerId.mockResolvedValue(mockSubscription);

      const result = await useCase.execute({ customerId: 'cust-1' });

      expect(result).toBe(mockSubscription);
      expect(mockSubscriptionRepository.findByCustomerId).toHaveBeenCalledWith('cust-1');
    });

    it('should throw SubscriptionNotFoundException when the customer has no subscription', async () => {
      mockSubscriptionRepository.findByCustomerId.mockResolvedValue(null);

      await expect(useCase.execute({ customerId: 'cust-unknown' })).rejects.toThrow(
        SubscriptionNotFoundException,
      );
    });
  });
});
