import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private repo: Repository<Like>,
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  async toggle(userId: number, postId: number): Promise<{ liked: boolean } | null> {
    const user = await this.usersService.findById(userId);
    const post = await this.postsService.findById(postId);
    if (!user || !post) return null;

    const existing = await this.repo.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existing) {
      await this.repo.remove(existing);
      return { liked: false };
    }

    const like = this.repo.create({ user, post });
    await this.repo.save(like);
    return { liked: true };
  }

  async countForPost(postId: number): Promise<number> {
    return this.repo.count({ where: { post: { id: postId } } });
  }
}
