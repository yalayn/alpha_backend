import { User } from '../entities/user.entity';

export interface UserRepository {
  save(user: User): Promise<void>;
  /**
   * Actualiza un usuario existente por su `id` (sin upsert). Necesario para
   * cambiar el email: `save()` busca por email y crearía un documento nuevo (SPE-008).
   */
  update(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
