import { ValidateAccessUseCase } from './validate-access.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Plan } from '@domain/entities/Plan';
import { Subscription } from '@domain/entities/Subscription';

describe('ValidateAccessUseCase', () => {
  let useCase: ValidateAccessUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const mockPlan = new Plan('plan-1', 'Pro', 29.99, 'USD', 'month', ['video-hd', 'export-pdf'], new Date());
  const activeSubscription = new Subscription('sub-1', 'cust-1', 'plan-1', 'pm-1', 'active', new Date(), null);

  const dto = { customerId: 'cust-1', featureId: 'video-hd' };

  beforeEach(() => {
    mockPlanRepository = {
      findById: jest.fn(),
    } as any;
    
    mockSubscriptionRepository = {
      findActiveByCustomerId: jest.fn(),
    } as any;

    useCase = new ValidateAccessUseCase(mockPlanRepository, mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should return hasAccess: true when customer has active subscription with the feature', async () => {
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(activeSubscription);
      mockPlanRepository.findById.mockResolvedValue(mockPlan);

      const result = await useCase.execute(dto);

      expect(result.hasAccess).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('should return hasAccess: false with reason no_active_subscription when customer has no subscription', async () => {
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(null);

      const result = await useCase.execute(dto);

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('no_active_subscription');
    });

    it('should return hasAccess: false with reason feature_not_in_plan when feature is not included', async () => {
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(activeSubscription);
      mockPlanRepository.findById.mockResolvedValue(mockPlan);

      const result = await useCase.execute({ customerId: 'cust-1', featureId: 'unsupported-feature' });

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('feature_not_in_plan');
    });

    it('should return hasAccess: false with reason subscription_expired when subscription has expired', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      
      const expiredSub = new Subscription('sub-1', 'cust-1', 'plan-1', 'pm-1', 'active', new Date('2020-01-01'), pastDate);
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(expiredSub);

      const result = await useCase.execute(dto);

      expect(result.hasAccess).toBe(false);
      expect(result.reason).toBe('subscription_expired');
      expect(result.subscriptionStatus).toBe('expired');
    });
  });
});
