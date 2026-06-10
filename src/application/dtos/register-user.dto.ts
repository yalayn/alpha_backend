import { UserRole } from '@domain/entities/user.entity';

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}
