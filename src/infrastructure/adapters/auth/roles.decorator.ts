import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@domain/entities/user.entity';

/**
 * Clave de metadata bajo la que se almacenan los roles permitidos.
 * `RolesGuard` la recupera con `Reflector.getAllAndOverride`.
 */
export const ROLES_KEY = 'roles';

/**
 * Declara los roles autorizados para un handler o un controlador entero.
 *
 * Es la mitad declarativa de la autorización por rol: marca *qué* roles pueden
 * acceder; `RolesGuard` hace cumplir la regla. Debe componerse junto a
 * `JwtAuthGuard` (que garantiza `req.user`), siempre DESPUÉS de él:
 *
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin')
 *   @Post()
 *   create() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
