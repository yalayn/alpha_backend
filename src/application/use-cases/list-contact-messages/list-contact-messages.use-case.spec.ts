import { ListContactMessagesUseCase } from './list-contact-messages.use-case';
import { ContactMessageRepository } from '@domain/ports/contact-message.repository.port';
import { ContactMessage } from '@domain/entities/contact-message.entity';

describe('ListContactMessagesUseCase', () => {
  let useCase: ListContactMessagesUseCase;
  let contactRepo: jest.Mocked<ContactMessageRepository>;

  beforeEach(() => {
    contactRepo = { save: jest.fn(), findAll: jest.fn() } as any;
    useCase = new ListContactMessagesUseCase(contactRepo);
  });

  it('devuelve todos los mensajes tal como los entrega el repositorio', async () => {
    const messages = [
      new ContactMessage('m2', 'u1', 'John', 'j@x.com', 'request', 'B', 'msg', new Date('2025-02-01')),
      new ContactMessage('m1', 'u1', 'John', 'j@x.com', 'comment', 'A', 'msg', new Date('2025-01-01')),
    ];
    contactRepo.findAll.mockResolvedValue(messages);

    const result = await useCase.execute();

    expect(contactRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe(messages);
  });

  it('devuelve un array vacío cuando no hay mensajes', async () => {
    contactRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
