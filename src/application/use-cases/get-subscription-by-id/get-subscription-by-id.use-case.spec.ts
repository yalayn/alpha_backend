import { GetSubscriptionByIdUseCase } from './get-subscription-by-id.use-case';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Subscription } from '@domain/entities/Subscription';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';

describe('GetSubscriptionByIdUseCase', () => {
  let useCase: GetSubscriptionByIdUseCase;
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
      findAll: jest.fn(),
    } as any;

    useCase = new GetSubscriptionByIdUseCase(mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should return the subscription when it exists', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(mockSubscription);

      const result = await useCase.execute({ subscriptionId: 'sub-1' });

      expect(result).toBe(mockSubscription);
      expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith('sub-1');
    });

    it('should throw SubscriptionNotFoundException when subscription does not exist', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ subscriptionId: 'missing' })).rejects.toThrow(
        SubscriptionNotFoundException,
      );
    });
  });
});
