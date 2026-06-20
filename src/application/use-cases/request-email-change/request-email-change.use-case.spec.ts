import { RequestEmailChangeUseCase } from './request-email-change.use-case';
import { User } from '@domain/entities/user.entity';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import { EmailMessage } from '@domain/ports/email-sender.port';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { EmailUnchangedException } from '@domain/exceptions/email-unchanged.exception';
import { EmailAlreadyInUseException } from '@domain/exceptions/email-already-in-use.exception';

class FakeUserRepository {
  private byId = new Map<string, User>();
  add(user: User) {
    this.byId.set(user.id, user);
  }
  async save() {}
  async update() {}
  async findById(id: string) {
    return this.byId.get(id) ?? null;
  }
  async findByEmail(email: string) {
    return [...this.byId.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
}

class FakeEmailChangeRepository {
  items: EmailChangeRequest[] = [];
  deletedFor: string[] = [];
  async save(req: EmailChangeRequest) {
    this.items = this.items.filter((r) => r.id !== req.id);
    this.items.push(req);
  }
  async findPendingByUserId(userId: string) {
    return this.items.find((r) => r.userId === userId && r.status === 'pending') ?? null;
  }
  async findPendingByTokenHash() {
    return null;
  }
  async deletePendingByUserId(userId: string) {
    this.deletedFor.push(userId);
    this.items = this.items.filter((r) => !(r.userId === userId && r.status === 'pending'));
  }
}

class FakeEmailSender {
  sent: EmailMessage[] = [];
  async send(message: EmailMessage) {
    this.sent.push(message);
  }
}

const APP_URL = 'http://localhost:5173';

function makeUser(): User {
  return new User('user-1', 'current@example.com', 'John', 'hash', 'customer', new Date());
}

describe('RequestEmailChangeUseCase', () => {
  let users: FakeUserRepository;
  let requests: FakeEmailChangeRepository;
  let sender: FakeEmailSender;
  let useCase: RequestEmailChangeUseCase;

  beforeEach(() => {
    users = new FakeUserRepository();
    requests = new FakeEmailChangeRepository();
    sender = new FakeEmailSender();
    users.add(makeUser());
    useCase = new RequestEmailChangeUseCase(
      users as any,
      requests as any,
      sender as any,
      APP_URL,
    );
  });

  it('CA-001: crea la solicitud y envía dos correos (actual y nuevo)', async () => {
    const result = await useCase.execute({ userId: 'user-1', newEmail: 'new@example.com' });

    expect(result.status).toBe('pending');
    expect(result.newEmail).toBe('new@example.com');
    expect(result.oldConfirmed).toBe(false);
    expect(result.newConfirmed).toBe(false);
    expect(sender.sent).toHaveLength(2);
    expect(sender.sent.map((m) => m.to).sort()).toEqual(
      ['current@example.com', 'new@example.com'].sort(),
    );
    // Los tokens viajan en el enlace, nunca el hash.
    expect(sender.sent[0].body).toContain(`${APP_URL}/account/email-change/confirm?token=`);
  });

  it('CA-002: 409 si el nuevo email ya está en uso por otro usuario', async () => {
    users.add(new User('user-2', 'taken@example.com', 'Other', 'h', 'customer', new Date()));
    await expect(
      useCase.execute({ userId: 'user-1', newEmail: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    expect(sender.sent).toHaveLength(0);
  });

  it('CA-003: 422 si el nuevo email es igual al actual', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', newEmail: 'current@example.com' }),
    ).rejects.toBeInstanceOf(EmailUnchangedException);
  });

  it('404 si el usuario del token ya no existe', async () => {
    await expect(
      useCase.execute({ userId: 'ghost', newEmail: 'new@example.com' }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('RN-005: una nueva solicitud reemplaza la pendiente anterior', async () => {
    await useCase.execute({ userId: 'user-1', newEmail: 'new@example.com' });
    await useCase.execute({ userId: 'user-1', newEmail: 'newer@example.com' });

    expect(requests.deletedFor).toContain('user-1');
    const pending = requests.items.filter((r) => r.status === 'pending');
    expect(pending).toHaveLength(1);
    expect(pending[0].newEmail).toBe('newer@example.com');
  });
});
