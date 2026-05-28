import { ListPlansUseCase } from './list-plans.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { Plan } from '@domain/entities/Plan';

describe('ListPlansUseCase', () => {
  let useCase: ListPlansUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;

  const mockPlan = new Plan('uuid-123', 'Pro', 29.99, 'USD', 'month', ['video-hd'], new Date());

  beforeEach(() => {
    mockPlanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
    };
    useCase = new ListPlansUseCase(mockPlanRepository);
  });

  describe('execute', () => {
    it('should return a list of plans', async () => {
      mockPlanRepository.findAll.mockResolvedValue([mockPlan]);
      const result = await useCase.execute();
      expect(mockPlanRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockPlan);
    });
  });
});
