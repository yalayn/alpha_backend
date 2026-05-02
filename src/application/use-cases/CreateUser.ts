import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User';
import { UserRepository, USER_REPOSITORY } from '../../domain/ports/UserRepository';
import { CreateUserDto } from '../dtos/CreateUserDto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = new User(
      Math.random().toString(36).substring(7),
      dto.email,
      dto.name,
    );
    await this.userRepository.save(user);
    return user;
  }
}
