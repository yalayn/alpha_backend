import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from './update-profile.use-case';
import { USER_REPOSITORY } from '../../../domain/ports/user.repository.port';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { User } from '../../../domain/entities/user.entity';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let userRepository: any;

  const existing = new User(
    'user-1',
    'john@example.com',
    'John Doe',
    'hashed-password',
    'customer',
    new Date('2025-01-01T12:00:00.000Z'),
  );

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
  });

  it('should update only the name, preserving the other fields', async () => {
    userRepository.findById.mockResolvedValue(existing);
    userRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute({ userId: 'user-1', name: 'Johnny Doe' });

    expect(result.name).toBe('Johnny Doe');
    // Inmutabilidad: el resto se preserva
    expect(result.id).toBe(existing.id);
    expect(result.email).toBe(existing.email);
    expect(result.password).toBe(existing.password);
    expect(result.role).toBe(existing.role);
    expect(result.createdAt).toBe(existing.createdAt);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', name: 'Johnny Doe', email: 'john@example.com' }),
    );
  });

  it('should throw UserNotFoundException when the user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'ghost', name: 'Whoever' }),
    ).rejects.toThrow(UserNotFoundException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
