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

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll() {
    return this.repo.find();
  }

  async updateUser(id: number, updateData: Partial<User>) {
    if (!Object.keys(updateData).length) {
      throw new BadRequestException('No data provided to update');
    }
    await this.repo.update(id, updateData);
    return this.findById(id);
  }
}
