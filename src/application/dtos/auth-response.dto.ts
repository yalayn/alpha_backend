import { User } from '../../domain/entities/user.entity';

export interface AuthResponseDto {
  accessToken: string;
  user: User;
}
