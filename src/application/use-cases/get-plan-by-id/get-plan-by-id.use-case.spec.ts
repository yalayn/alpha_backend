import { GetPlanByIdUseCase } from './get-plan-by-id.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { Plan } from '@domain/entities/Plan';
import { PlanNotFoundException } from '@domain/exceptions/plan-not-found.exception';

describe('GetPlanByIdUseCase', () => {
  let useCase: GetPlanByIdUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;

  const mockPlan = new Plan('uuid-123', 'Pro', 29.99, 'USD', 'month', ['video-hd'], new Date());

  beforeEach(() => {
    mockPlanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      deleteById: jest.fn(),
    };
    useCase = new GetPlanByIdUseCase(mockPlanRepository);
  });

  describe('execute', () => {
    it('should return the plan when found', async () => {
      mockPlanRepository.findById.mockResolvedValue(mockPlan);
      const result = await useCase.execute({ planId: 'uuid-123' });
      expect(mockPlanRepository.findById).toHaveBeenCalledWith('uuid-123');
      expect(result).toBe(mockPlan);
    });

    it('should throw PlanNotFoundException when plan is not found', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute({ planId: 'not-found' })).rejects.toThrow(PlanNotFoundException);
      expect(mockPlanRepository.findById).toHaveBeenCalledWith('not-found');
    });
  });
});
