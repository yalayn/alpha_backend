import { UpdatePlanUseCase } from './update-plan.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Plan } from '@domain/entities/Plan';
import { Subscription } from '@domain/entities/Subscription';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { PlanAlreadyExistsException } from '@domain/exceptions/plan-already-exists.exception';
import { PlanIntervalLockedException } from '@domain/exceptions/plan-interval-locked.exception';

describe('UpdatePlanUseCase', () => {
  let useCase: UpdatePlanUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const existingPlan = new Plan('plan-1', 'Pro', 29.99, 'USD', 'month', ['feature-a', 'feature-b'], new Date('2025-01-01'));
  const otherPlan = new Plan('plan-2', 'Enterprise', 99.99, 'USD', 'month', ['feature-a'], new Date('2025-01-01'));
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

    useCase = new UpdatePlanUseCase(mockPlanRepository, mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should throw PlanNotFoundException when plan does not exist', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ planId: 'nonexistent', name: 'New Name' }))
        .rejects.toThrow(PlanNotFoundException);
      expect(mockPlanRepository.save).not.toHaveBeenCalled();
    });

    it('CA-001: should update name and return updated plan', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockPlanRepository.findByName.mockResolvedValue(null);
      mockPlanRepository.save.mockImplementation(async (p) => p);

      const result = await useCase.execute({ planId: 'plan-1', name: 'Pro Plus' });

      expect(result.name).toBe('Pro Plus');
      expect(result.price).toBe(29.99);
      expect(result.interval).toBe('month');
      expect(mockPlanRepository.save).toHaveBeenCalledTimes(1);
    });

    it('CA-002: should throw PlanAlreadyExistsException when new name is taken by another plan', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockPlanRepository.findByName.mockResolvedValue(otherPlan);

      await expect(useCase.execute({ planId: 'plan-1', name: 'Enterprise' }))
        .rejects.toThrow(PlanAlreadyExistsException);
      expect(mockPlanRepository.save).not.toHaveBeenCalled();
    });

    it('should not check name conflict when name is unchanged', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockPlanRepository.save.mockImplementation(async (p) => p);

      await useCase.execute({ planId: 'plan-1', name: 'Pro', price: 39.99 });

      expect(mockPlanRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw PlanIntervalLockedException when changing interval with active subscriptions', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockSubscriptionRepository.findActiveByPlanId.mockResolvedValue([activeSub]);

      await expect(useCase.execute({ planId: 'plan-1', interval: 'year' }))
        .rejects.toThrow(PlanIntervalLockedException);
      expect(mockPlanRepository.save).not.toHaveBeenCalled();
    });

    it('should allow interval change when there are no active subscriptions', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockSubscriptionRepository.findActiveByPlanId.mockResolvedValue([]);
      mockPlanRepository.save.mockImplementation(async (p) => p);

      const result = await useCase.execute({ planId: 'plan-1', interval: 'year' });

      expect(result.interval).toBe('year');
    });

    it('should apply only the provided fields and keep the rest unchanged', async () => {
      mockPlanRepository.findById.mockResolvedValue(existingPlan);
      mockPlanRepository.save.mockImplementation(async (p) => p);

      const result = await useCase.execute({ planId: 'plan-1', price: 49.99 });

      expect(result.price).toBe(49.99);
      expect(result.name).toBe('Pro');
      expect(result.currency).toBe('USD');
      expect(result.features).toEqual(['feature-a', 'feature-b']);
    });
  });
});
