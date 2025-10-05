import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>, private usersService: UsersService) {}

  async create(dto: CreateCommentDto) {
    const user = await this.usersService.findById(dto.userId);
if (!user) throw new Error('User not found'); // or NestJS NotFoundException

    const comment = this.repo.create({
      user,
      postId: dto.postId,
      eventId: dto.eventId,
      content: dto.content,
    });
    return this.repo.save(comment);
  }

  async findByPost(postId: number) {
    return this.repo.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }

  async findByEvent(eventId: number) {
    return this.repo.find({ where: { eventId }, order: { createdAt: 'ASC' } });
  }
}
