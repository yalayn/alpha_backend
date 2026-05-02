import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/CreateUser';
import { CreateUserDto } from '../../application/dtos/CreateUserDto';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.createUserUseCase.execute(dto);
  }
}
