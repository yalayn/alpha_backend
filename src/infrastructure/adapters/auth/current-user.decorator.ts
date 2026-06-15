import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Forma del usuario que la JwtStrategy deja en `req.user` tras validar el token.
 * Ver `jwt.strategy.ts` → `validate()`.
 */
export interface CurrentUserPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Extrae el usuario autenticado (`req.user`) inyectado por `JwtAuthGuard`.
 *
 * Uso:
 *   getMe(@CurrentUser() user: CurrentUserPayload)      → objeto completo
 *   getMe(@CurrentUser('userId') userId: string)        → una sola propiedad
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;
    return data ? user?.[data] : user;
  },
);
