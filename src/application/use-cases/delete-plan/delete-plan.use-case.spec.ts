import { DeletePlanUseCase } from './delete-plan.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Plan } from '@domain/entities/Plan';
import { Subscription } from '@domain/entities/Subscription';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { PlanHasActiveSubscriptionsException } from '@domain/exceptions/plan-has-active-subscriptions.exception';

describe('DeletePlanUseCase', () => {
  let useCase: DeletePlanUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const existingPlan = new Plan('plan-1', 'Pro', 29.99, 'USD', 'month', ['feature-a'], new Date('2025-01-01'));
  const activeSub = new Subscription('sub-1', 'cust-1', 'plan-1', 'pm-1', 'active', new Date(), new Date('2026-12-01'));

  beforeEach(() => {
    mockPlanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      deleteById: jest.fn(),
    } as any;

    mockSubscriptionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findActiveByCustomerId: jest.fn(),
      findActiveByPlanId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new DeletePlanUseCase(mockPlanRepository, mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should throw PlanNotFoundException when plan does not exist', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ planId: 'nonexistent' }))
        .rejects.toThrow(PlanNotFoundException);
      expect(mockPlanRepository.deleteById).not.toHaveBeenCalled();
    });

    it('CA-004: should throw PlanHasActiveSubscriptionsException when plan has active subscriptions', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockSubscriptionRepository.findActiveByPlanId.mockResolvedValue([activeSub]);

      await expect(useCase.execute({ planId: 'plan-1' }))
        .rejects.toThrow(PlanHasActiveSubscriptionsException);
      expect(mockPlanRepository.deleteById).not.toHaveBeenCalled();
    });

    it('CA-003: should delete and return the plan when no active subscriptions', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockSubscriptionRepository.findActiveByPlanId.mockResolvedValue([]);
      mockPlanRepository.deleteById.mockResolvedValue(existingPlan);

      const result = await useCase.execute({ planId: 'plan-1' });

      expect(result).toEqual(existingPlan);
      expect(mockPlanRepository.deleteById).toHaveBeenCalledWith('plan-1');
    });

    it('should call deleteById exactly once', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockSubscriptionRepository.findActiveByPlanId.mockResolvedValue([]);
      mockPlanRepository.deleteById.mockResolvedValue(existingPlan);

      await useCase.execute({ planId: 'plan-1' });

      expect(mockPlanRepository.deleteById).toHaveBeenCalledTimes(1);
    });
  });
});
