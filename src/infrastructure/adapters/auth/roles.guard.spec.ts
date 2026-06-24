import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@domain/entities/user.entity';
import { CurrentUserPayload } from './current-user.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const buildContext = (user?: Partial<CurrentUserPayload>): ExecutionContext =>
    ({
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  const mockRequiredRoles = (roles: UserRole[] | undefined) =>
    reflector.getAllAndOverride.mockReturnValue(roles);

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('deja pasar cuando el handler no declara @Roles (aditivo)', () => {
    mockRequiredRoles(undefined);

    expect(guard.canActivate(buildContext({ role: 'customer' }))).toBe(true);
  });

  it('deja pasar cuando @Roles está vacío', () => {
    mockRequiredRoles([]);

    expect(guard.canActivate(buildContext({ role: 'customer' }))).toBe(true);
  });

  it('deja pasar cuando el rol del usuario coincide con el requerido', () => {
    mockRequiredRoles(['admin']);

    expect(
      guard.canActivate(
        buildContext({ userId: 'u1', email: 'a@b.c', role: 'admin' }),
      ),
    ).toBe(true);
  });

  it('lanza ForbiddenException cuando el rol no coincide', () => {
    mockRequiredRoles(['admin']);

    expect(() =>
      guard.canActivate(buildContext({ role: 'customer' })),
    ).toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException cuando no hay usuario en la petición', () => {
    mockRequiredRoles(['admin']);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      ForbiddenException,
    );
  });
});
