import { CancelSubscriptionUseCase } from './cancel-subscription.use-case';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Subscription } from '@domain/entities/Subscription';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { SubscriptionAlreadyCanceledException } from '@domain/exceptions/subscription-already-canceled.exception';

describe('CancelSubscriptionUseCase', () => {
  let useCase: CancelSubscriptionUseCase;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const activeSubscription = new Subscription(
    'sub-1',
    'cust-1',
    'plan-1',
    'pm-1',
    'active',
    new Date(),
    new Date(),
  );

  const canceledSubscription = new Subscription(
    'sub-2',
    'cust-1',
    'plan-1',
    'pm-1',
    'canceled',
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

    useCase = new CancelSubscriptionUseCase(mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should cancel an active subscription', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(activeSubscription);
      mockSubscriptionRepository.save.mockImplementation(async (s) => s);

      const result = await useCase.execute({ subscriptionId: 'sub-1' });

      expect(result.status).toBe('canceled');
      expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'canceled' }),
      );
    });

    it('should throw SubscriptionNotFoundException when subscription does not exist', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ subscriptionId: 'missing' })).rejects.toThrow(
        SubscriptionNotFoundException,
      );
    });

    it('should throw SubscriptionAlreadyCanceledException when already canceled', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(canceledSubscription);

      await expect(useCase.execute({ subscriptionId: 'sub-2' })).rejects.toThrow(
        SubscriptionAlreadyCanceledException,
      );
    });
  });
});
