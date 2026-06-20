import { ConfirmEmailChangeUseCase } from './confirm-email-change.use-case';
import { ApplyEmailChangeUseCase } from '../apply-email-change/apply-email-change.use-case';
import { User } from '@domain/entities/user.entity';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import { hashToken } from '@application/utils/token.util';
import { InvalidTokenException } from '@domain/exceptions/invalid-token.exception';
import { TokenExpiredException } from '@domain/exceptions/token-expired.exception';
import { EmailAlreadyInUseException } from '@domain/exceptions/email-already-in-use.exception';

const OLD_TOKEN = 'old-raw-token';
const NEW_TOKEN = 'new-raw-token';

class FakeUserRepository {
  byId = new Map<string, User>();
  byEmailExtra: User[] = [];
  updated: User[] = [];
  add(user: User) {
    this.byId.set(user.id, user);
  }
  async save() {}
  async update(user: User) {
    this.updated.push(user);
    this.byId.set(user.id, user);
  }
  async findById(id: string) {
    return this.byId.get(id) ?? null;
  }
  async findByEmail(email: string) {
    const all = [...this.byId.values(), ...this.byEmailExtra];
    return all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
}

class FakeEmailChangeRepository {
  items: EmailChangeRequest[] = [];
  async save(req: EmailChangeRequest) {
    this.items = this.items.filter((r) => r.id !== req.id);
    this.items.push(req);
  }
  async findPendingByUserId(userId: string) {
    return this.items.find((r) => r.userId === userId && r.status === 'pending') ?? null;
  }
  async findPendingByTokenHash(hash: string) {
    return (
      this.items.find(
        (r) =>
          r.status === 'pending' &&
          (r.oldTokenHash === hash || r.newTokenHash === hash),
      ) ?? null
    );
  }
  async deletePendingByUserId() {}
}

function makePendingRequest(overrides: Partial<{ expiresAt: Date; oldConfirmedAt?: Date }> = {}) {
  const now = new Date();
  return new EmailChangeRequest(
    'req-1',
    'user-1',
    'new@example.com',
    hashToken(OLD_TOKEN),
    hashToken(NEW_TOKEN),
    'pending',
    now,
    overrides.expiresAt ?? new Date(now.getTime() + 3_600_000),
    overrides.oldConfirmedAt,
  );
}

describe('ConfirmEmailChangeUseCase', () => {
  let users: FakeUserRepository;
  let requests: FakeEmailChangeRepository;
  let useCase: ConfirmEmailChangeUseCase;

  beforeEach(() => {
    users = new FakeUserRepository();
    users.add(new User('user-1', 'current@example.com', 'John', 'h', 'customer', new Date()));
    requests = new FakeEmailChangeRepository();
    const apply = new ApplyEmailChangeUseCase(users as any, requests as any);
    useCase = new ConfirmEmailChangeUseCase(requests as any, apply);
  });

  it('CA-004: confirmar el primer token deja el lado confirmado sin aplicar', async () => {
    await requests.save(makePendingRequest());

    const result = await useCase.execute({ token: OLD_TOKEN });

    expect(result).toEqual({ side: 'old', bothConfirmed: false, applied: false });
    expect(users.updated).toHaveLength(0);
    const stored = await requests.findPendingByUserId('user-1');
    expect(stored?.oldConfirmed).toBe(true);
    expect(stored?.newConfirmed).toBe(false);
  });

  it('CA-005: confirmar el segundo token aplica el cambio y actualiza el email', async () => {
    await requests.save(makePendingRequest({ oldConfirmedAt: new Date() }));

    const result = await useCase.execute({ token: NEW_TOKEN });

    expect(result).toEqual({ side: 'new', bothConfirmed: true, applied: true });
    expect(users.updated).toHaveLength(1);
    expect(users.updated[0].email).toBe('new@example.com');
    expect(requests.items[0].status).toBe('applied');
  });

  it('CA-006: token inexistente/usado → invalid_token (400)', async () => {
    await expect(useCase.execute({ token: 'nope' })).rejects.toBeInstanceOf(InvalidTokenException);
  });

  it('CA-006: token expirado → token_expired (410)', async () => {
    await requests.save(makePendingRequest({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(useCase.execute({ token: OLD_TOKEN })).rejects.toBeInstanceOf(TokenExpiredException);
  });

  it('CA-007: si el nuevo email fue tomado entre solicitar y aplicar → 409 y no cambia', async () => {
    await requests.save(makePendingRequest({ oldConfirmedAt: new Date() }));
    users.byEmailExtra.push(
      new User('intruder', 'new@example.com', 'X', 'h', 'customer', new Date()),
    );

    await expect(useCase.execute({ token: NEW_TOKEN })).rejects.toBeInstanceOf(
      EmailAlreadyInUseException,
    );
    expect(users.updated).toHaveLength(0);
    expect(requests.items[0].status).toBe('failed');
  });

  it('idempotente: confirmar el mismo lado dos veces no avanza', async () => {
    await requests.save(makePendingRequest());

    const first = await useCase.execute({ token: OLD_TOKEN });
    const second = await useCase.execute({ token: OLD_TOKEN });

    expect(first.applied).toBe(false);
    expect(second).toEqual({ side: 'old', bothConfirmed: false, applied: false });
    expect(users.updated).toHaveLength(0);
  });
});
