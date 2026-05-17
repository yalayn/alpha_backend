import { LoginUseCase } from './login.use-case';
import { UserRepository } from '../../../domain/ports/user.repository.port';
import { IAuthService } from '../../../domain/ports/auth.service.port';
import { User } from '../../../domain/entities/user.entity';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAuthService: jest.Mocked<IAuthService>;

  const mockUser = new User(
    'uuid-123',
    'test@example.com',
    'Test User',
    'hashedPassword',
    'customer',
    new Date(),
  );

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    mockAuthService = {
      generateToken: jest.fn(),
    };
    useCase = new LoginUseCase(mockUserRepository, mockAuthService);
    jest.clearAllMocks();
  });

  it('should return AuthResponseDto when credentials are valid', async () => {
    const dto = { email: 'test@example.com', password: 'password123' };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockAuthService.generateToken.mockReturnValue('mockToken');

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('mockToken');
    expect(result.user).toEqual(mockUser);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockAuthService.generateToken).toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when user not found', async () => {
    const dto = { email: 'wrong@example.com', password: 'password123' };
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password is invalid', async () => {
    const dto = { email: 'test@example.com', password: 'wrongpassword' };
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidCredentialsException);
  });
});
