import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@domain/entities/user.entity';
import { ROLES_KEY } from './roles.decorator';
import { CurrentUserPayload } from './current-user.decorator';

/**
 * Autorización por rol en el servidor.
 *
 * Lee los roles permitidos declarados con `@Roles(...)` y los compara con el
 * rol del usuario autenticado (`req.user.role`, inyectado por `JwtStrategy`).
 *
 * Reglas (ver SPE-010):
 * - **Aditivo**: si el handler no declara `@Roles`, no restringe (deja pasar).
 *   Así registrar el guard a nivel de controlador no rompe endpoints abiertos.
 * - Debe componerse **después** de `JwtAuthGuard`, que garantiza `req.user`.
 * - No consulta la base de datos: confía en el `role` del JWT ya validado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      UserRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // Sin @Roles → este handler no está restringido por rol.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;

    if (!user || !requiredRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException('Insufficient role to perform this action');
    }

    return true;
  }
}
