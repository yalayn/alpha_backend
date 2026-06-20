import { GetEmailChangeStatusUseCase } from './get-email-change-status.use-case';
import { EmailChangeRequest } from '@domain/entities/email-change-request.entity';
import { EmailChangeNotFoundException } from '@domain/exceptions/email-change-not-found.exception';
import { EmailChangeStatusPresenter } from '../../../infrastructure/presenters/email-change-status.presenter';

class FakeEmailChangeRepository {
  items: EmailChangeRequest[] = [];
  async save() {}
  async findPendingByUserId(userId: string) {
    return this.items.find((r) => r.userId === userId && r.status === 'pending') ?? null;
  }
  async findPendingByTokenHash() {
    return null;
  }
  async deletePendingByUserId() {}
}

describe('GetEmailChangeStatusUseCase', () => {
  let requests: FakeEmailChangeRepository;
  let useCase: GetEmailChangeStatusUseCase;

  beforeEach(() => {
    requests = new FakeEmailChangeRepository();
    useCase = new GetEmailChangeStatusUseCase(requests as any);
  });

  it('404 cuando no hay solicitud pendiente', async () => {
    await expect(useCase.execute('user-1')).rejects.toBeInstanceOf(EmailChangeNotFoundException);
  });

  it('devuelve la solicitud pendiente', async () => {
    requests.items.push(
      new EmailChangeRequest(
        'r1',
        'user-1',
        'new@example.com',
        'oldhash',
        'newhash',
        'pending',
        new Date(),
        new Date(Date.now() + 3_600_000),
      ),
    );
    const result = await useCase.execute('user-1');
    expect(result.newEmail).toBe('new@example.com');
  });

  it('CA-008: el presenter nunca expone los valores de los tokens', () => {
    const req = new EmailChangeRequest(
      'r1',
      'user-1',
      'new@example.com',
      'oldhash',
      'newhash',
      'pending',
      new Date(),
      new Date(Date.now() + 3_600_000),
    );
    const response = EmailChangeStatusPresenter.toResponse(req);
    const serialized = JSON.stringify(response);
    expect(serialized).not.toContain('oldhash');
    expect(serialized).not.toContain('newhash');
    expect(response).toEqual({
      newEmail: 'new@example.com',
      oldEmailConfirmed: false,
      newEmailConfirmed: false,
      status: 'pending',
      expiresAt: req.expiresAt.toISOString(),
    });
  });
});
