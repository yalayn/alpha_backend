import { SubscribeCustomerUseCase } from './subscribe-customer.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { ISubscriptionRepository } from '@domain/ports/subscription.repository.port';
import { Plan } from '@domain/entities/Plan';
import { Subscription } from '@domain/entities/Subscription';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';
import { SubscriptionAlreadyActiveException } from '@domain/exceptions/subscription-already-active.exception';

describe('SubscribeCustomerUseCase', () => {
  let useCase: SubscribeCustomerUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;
  let mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository>;

  const mockPlan = new Plan('plan-1', 'Pro', 29.99, 'USD', 'month', ['video-hd'], new Date());
  const mockSubscription = new Subscription(
    'sub-1', 
    'cust-1', 
    'plan-1', 
    'pm-1', 
    'active', 
    new Date(), 
    new Date()
  );

  const validDto = { 
    customerId: 'cust-1', 
    planId: 'plan-1', 
    paymentMethodId: 'pm-1' 
  };

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

    useCase = new SubscribeCustomerUseCase(mockPlanRepository, mockSubscriptionRepository);
  });

  describe('execute', () => {
    it('should create an active subscription when plan exists and customer has no active subscription', async () => {
      mockPlanRepository.findById.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(null);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      const result = await useCase.execute(validDto);

      expect(result.status).toBe('active');
      expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1);
      expect(result.customerId).toBe('cust-1');
    });

    it('should calculate endDate correctly for a monthly plan', async () => {
      mockPlanRepository.findById.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(null);
      mockSubscriptionRepository.save.mockImplementation(async (sub) => sub);

      const result = await useCase.execute(validDto);

      const expectedDate = new Date();
      expectedDate.setMonth(expectedDate.getMonth() + 1);
      
      // Comparamos mes y año para evitar milisegundos de diferencia
      expect(result.endDate?.getMonth()).toBe(expectedDate.getMonth());
      expect(result.endDate?.getFullYear()).toBe(expectedDate.getFullYear());
    });

    it('should throw PlanNotFoundException when plan does not exist', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDto)).rejects.toThrow(PlanNotFoundException);
      expect(mockSubscriptionRepository.save).not.toHaveBeenCalled();
    });

    it('should throw SubscriptionAlreadyActiveException when customer already has an active subscription', async () => {
      mockPlanRepository.findById.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findActiveByCustomerId.mockResolvedValue(mockSubscription);

      await expect(useCase.execute(validDto)).rejects.toThrow(SubscriptionAlreadyActiveException);
      expect(mockSubscriptionRepository.save).not.toHaveBeenCalled();
    });
  });
});
