import { CreatePlanUseCase } from './create-plan.use-case';
import { IPlanRepository } from '@domain/ports/plan.repository.port';
import { Plan } from '@domain/entities/Plan';
import { PlanAlreadyExistsException } from '@domain/exceptions/plan-already-exists.exception';
import { CreatePlanDto } from '@application/dtos/create-plan.dto';

describe('CreatePlanUseCase', () => {
  let useCase: CreatePlanUseCase;
  let mockPlanRepository: jest.Mocked<IPlanRepository>;

  const validDto: CreatePlanDto = {
    name: 'Pro',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: ['video-hd', 'export-pdf'],
  };

  const mockPlan = new Plan('uuid-123', 'Pro', 29.99, 'USD', 'month', ['video-hd'], new Date());

  beforeEach(() => {
    mockPlanRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
    } as any;
    useCase = new CreatePlanUseCase(mockPlanRepository);
  });

  describe('execute', () => {
    it('should create and persist a new plan when name is unique', async () => {
      mockPlanRepository.findByName.mockResolvedValue(null);
      mockPlanRepository.save.mockResolvedValue(mockPlan);

      const result = await useCase.execute(validDto);

      expect(mockPlanRepository.findByName).toHaveBeenCalledWith('Pro');
      expect(mockPlanRepository.save).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Pro');
    });

    it('should throw PlanAlreadyExistsException when name is already taken', async () => {
      mockPlanRepository.findByName.mockResolvedValue(mockPlan);

      await expect(useCase.execute(validDto)).rejects.toThrow(PlanAlreadyExistsException);
      expect(mockPlanRepository.save).not.toHaveBeenCalled();
    });

    it('should generate a unique id for each plan', async () => {
      mockPlanRepository.findByName.mockResolvedValue(null);
      mockPlanRepository.save.mockImplementation(async (p) => p);

      const result = await useCase.execute(validDto);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });
  });
});
