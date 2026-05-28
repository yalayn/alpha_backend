import { UserRole } from '@domain/entities/user.entity';

export class RegisterUserDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly role: UserRole = 'customer',
  ) {}
}
