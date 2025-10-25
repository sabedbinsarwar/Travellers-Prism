import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(name: string, email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ name, email, password: hashed });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } }); // add relations if needed later
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    if (!Object.keys(updateData).length) {
      throw new BadRequestException('No data provided to update');
    }
    await this.repo.update(id, updateData);
    return this.findById(id);
  }
}
