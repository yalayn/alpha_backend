import { ChangePlanUseCase } from './change-plan.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Plan } from '@domain/entities/Plan';
import { Subscription } from '@domain/entities/Subscription';
import { SubscriptionNotFoundException } from '@domain/exceptions/subscription-not-found.exception';
import { SubscriptionNotActiveException } from '@domain/exceptions/subscription-not-active.exception';
import { SamePlanChangeException } from '@domain/exceptions/same-plan-change.exception';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';

describe('ChangePlanUseCase', () => {
  let useCase: ChangePlanUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const endDate = new Date('2026-01-01T00:00:00.000Z');
  const monthlyPlanA = new Plan('plan-monthly-a', 'Basic Monthly', 9.99, 'USD', 'month', ['feature-a'], new Date());
  const monthlyPlanB = new Plan('plan-monthly-b', 'Pro Monthly', 29.99, 'USD', 'month', ['feature-a', 'feature-b'], new Date());
  const annualPlanA = new Plan('plan-annual-a', 'Pro Annual', 299.99, 'USD', 'year', ['feature-a', 'feature-b'], new Date());
  const monthlyPlanC = new Plan('plan-monthly-c', 'Basic Monthly Alt', 9.99, 'USD', 'month', ['feature-a'], new Date());

  const activeMonthlySubscription = new Subscription('sub-1', 'cust-1', 'plan-monthly-a', 'pm-1', 'active', new Date(), endDate);
  const activeAnnualSubscription = new Subscription('sub-2', 'cust-1', 'plan-annual-a', 'pm-1', 'active', new Date(), endDate);
  const canceledSubscription = new Subscription('sub-3', 'cust-1', 'plan-monthly-a', 'pm-1', 'canceled', new Date(), endDate);

  const baseDto = { subscriptionId: 'sub-1', newPlanId: 'plan-monthly-b', paymentMethodId: 'pm-2' };

  beforeEach(() => {
    mockPlanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
    } as any;

    mockSubscriptionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findActiveByCustomerId: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new ChangePlanUseCase(mockPlanRepository, mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should throw SubscriptionNotFoundException when subscription does not exist', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(baseDto)).rejects.toThrow(SubscriptionNotFoundException);
      expect(mockSubscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw SubscriptionNotActiveException when subscription is not active', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(canceledSubscription);

      await expect(useCase.execute({ ...baseDto, subscriptionId: 'sub-3' })).rejects.toThrow(SubscriptionNotActiveException);
      expect(mockSubscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw SamePlanChangeException when newPlanId equals current planId', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(activeMonthlySubscription);

      await expect(useCase.execute({ ...baseDto, newPlanId: 'plan-monthly-a' })).rejects.toThrow(SamePlanChangeException);
      expect(mockSubscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw PlanNotFoundException when new plan does not exist', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(activeMonthlySubscription);
      mockPlanRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute({ ...baseDto, newPlanId: 'nonexistent' })).rejects.toThrow(PlanNotFoundException);
      expect(mockSubscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('should do immediate change (monthly→monthly) and update planId', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(activeMonthlySubscription);
      mockPlanRepository.findById.mockImplementation(async (id) => {
        if (id === 'plan-monthly-b') return monthlyPlanB;
        if (id === 'plan-monthly-a') return monthlyPlanA;
        return null;
      });
      mockSubscriptionRepository.save.mockImplementation(async (sub) => sub);

      const result = await useCase.execute({ subscriptionId: 'sub-1', newPlanId: 'plan-monthly-b', paymentMethodId: 'pm-2' });

      expect(result.planId).toBe('plan-monthly-b');
      expect(result.scheduledPlanId).toBeUndefined();
    });

    it('should do immediate change (annual→annual) and update planId', async () => {
      const annualPlanB = new Plan('plan-annual-b', 'Enterprise Annual', 999.99, 'USD', 'year', ['feature-a', 'feature-b', 'feature-c'], new Date());
      mockSubscriptionRepository.findById.mockResolvedValue(activeAnnualSubscription);
      mockPlanRepository.findById.mockImplementation(async (id) => {
        if (id === 'plan-annual-b') return annualPlanB;
        if (id === 'plan-annual-a') return annualPlanA;
        return null;
      });
      mockSubscriptionRepository.save.mockImplementation(async (sub) => sub);

      const result = await useCase.execute({ subscriptionId: 'sub-2', newPlanId: 'plan-annual-b', paymentMethodId: 'pm-2' });

      expect(result.planId).toBe('plan-annual-b');
      expect(result.scheduledPlanId).toBeUndefined();
    });

    it('should do scheduled change (annual→monthly) and set scheduledPlanId without updating planId', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(activeAnnualSubscription);
      mockPlanRepository.findById.mockImplementation(async (id) => {
        if (id === 'plan-monthly-c') return monthlyPlanC;
        if (id === 'plan-annual-a') return annualPlanA;
        return null;
      });
      mockSubscriptionRepository.save.mockImplementation(async (sub) => sub);

      const result = await useCase.execute({ subscriptionId: 'sub-2', newPlanId: 'plan-monthly-c', paymentMethodId: 'pm-2' });

      expect(result.planId).toBe('plan-annual-a');
      expect(result.scheduledPlanId).toBe('plan-monthly-c');
    });

    it('should persist the updated subscription via repository', async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(activeMonthlySubscription);
      mockPlanRepository.findById.mockImplementation(async (id) => {
        if (id === 'plan-monthly-b') return monthlyPlanB;
        if (id === 'plan-monthly-a') return monthlyPlanA;
        return null;
      });
      mockSubscriptionRepository.save.mockImplementation(async (sub) => sub);

      await useCase.execute({ subscriptionId: 'sub-1', newPlanId: 'plan-monthly-b', paymentMethodId: 'pm-2' });

      expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
