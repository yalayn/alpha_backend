import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserUseCase } from './get-current-user.use-case';
import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { User } from '../../../domain/entities/user.entity';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCurrentUserUseCase>(GetCurrentUserUseCase);
  });

  it('should return the user when it exists', async () => {
    const user = new User('user-1', 'john@example.com', 'John Doe', 'hashed', 'customer');
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute('user-1');

    expect(result).toBe(user);
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });

  it('should throw UserNotFoundException when the user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('ghost')).rejects.toThrow(UserNotFoundException);
  });
});
