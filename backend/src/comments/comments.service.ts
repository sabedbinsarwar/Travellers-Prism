import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private repo: Repository<Comment>,
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

 async create(userId: number, postId: number, content: string) {
  const user = await this.usersService.findById(userId);
  const post = await this.postsService.findById(postId);

  if (!user || !post) return null;

  const comment = this.repo.create({ content, user, post });
  return this.repo.save(comment);
}


  async findByPostId(postId: number): Promise<Comment[]> {
    return this.repo.find({
      where: { post: { id: postId } },
      relations: ["user"], // ✅ include user info for frontend (name, profilePic)
      order: { createdAt: "ASC" },
    });
  }
}
