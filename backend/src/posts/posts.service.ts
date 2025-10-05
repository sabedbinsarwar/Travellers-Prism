import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private repo: Repository<Post>, private usersService: UsersService) {}

  async create(dto: CreatePostDto) {
    const user = (await this.usersService.findById(dto.userId)) as User;
    const post = this.repo.create({
      user,
      content: dto.content,
      images: dto.images || [],
      videos: dto.videos || [],
    });
    return this.repo.save(post);
  }

  async all() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}
