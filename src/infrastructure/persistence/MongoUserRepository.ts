import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository';

@Injectable()
export class MongoUserRepository implements UserRepository {
  private users: User[] = [];

  async save(user: User): Promise<void> {
    this.users.push(user);
    console.log(`User ${user.name} saved to Mongo (mock)`);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }
}
