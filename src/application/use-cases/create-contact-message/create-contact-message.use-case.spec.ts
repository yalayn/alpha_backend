import { CreateContactMessageUseCase } from './create-contact-message.use-case';
import { ContactMessageRepository } from '@domain/ports/contact-message.repository.port';
import { UserRepository } from '@domain/ports/user.repository.port';
import { User } from '@domain/entities/user.entity';
import { ContactMessage } from '@domain/entities/contact-message.entity';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';

// uuid v14 se distribuye como ESM y jest no lo transforma (node_modules).
// Mismo patrón que register-user.use-case.spec.ts.
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('CreateContactMessageUseCase', () => {
  let useCase: CreateContactMessageUseCase;
  let contactRepo: jest.Mocked<ContactMessageRepository>;
  let userRepo: jest.Mocked<UserRepository>;

  const sender = new User(
    'user-1',
    'john.doe@example.com',
    'John Doe',
    'hashed',
    'customer',
    new Date('2025-01-01'),
  );

  beforeEach(() => {
    contactRepo = { save: jest.fn(), findAll: jest.fn() } as any;
    userRepo = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as any;
    useCase = new CreateContactMessageUseCase(contactRepo, userRepo);
  });

  it('persiste el mensaje con un snapshot del remitente (nombre + email del JWT)', async () => {
    userRepo.findById.mockResolvedValue(sender);

    const result = await useCase.execute({
      senderId: 'user-1',
      type: 'comment',
      subject: 'Sugerencia',
      message: 'Un mensaje suficientemente largo.',
    });

    expect(userRepo.findById).toHaveBeenCalledWith('user-1');
    expect(contactRepo.save).toHaveBeenCalledTimes(1);
    const saved = contactRepo.save.mock.calls[0][0] as ContactMessage;
    expect(saved).toBeInstanceOf(ContactMessage);
    expect(saved.senderId).toBe('user-1');
    expect(saved.senderName).toBe('John Doe');
    expect(saved.senderEmail).toBe('john.doe@example.com');
    expect(saved.type).toBe('comment');
    expect(saved.subject).toBe('Sugerencia');
    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(result).toBe(saved);
  });

  it('lanza UserNotFoundException si el remitente del token ya no existe', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        senderId: 'ghost',
        type: 'request',
        subject: 'Hola',
        message: 'Un mensaje suficientemente largo.',
      }),
    ).rejects.toThrow(UserNotFoundException);
    expect(contactRepo.save).not.toHaveBeenCalled();
  });
});
