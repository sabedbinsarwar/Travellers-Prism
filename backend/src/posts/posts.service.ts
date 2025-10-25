import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.userRepo.findOneBy({ id: +createPostDto.userId });
    if (!user) throw new NotFoundException('User not found');

    const post = this.repo.create({
      ...createPostDto,
      user,
      images: createPostDto.images || [],
      videos: createPostDto.videos || [],
    });

    return this.repo.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'comments', 'likes'],
    });
  }

  async findByUser(userId: string): Promise<Post[]> {
    return this.repo.find({
      where: { user: { id: +userId } },
      order: { createdAt: 'DESC' },
      relations: ['user', 'comments', 'likes'],
    });
  }

  async findById(id: number): Promise<Post> {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['user', 'comments', 'likes'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.repo.findOne({ where: { id }, relations: ['user', 'comments', 'likes'] });
    if (!post) throw new NotFoundException('Post not found');

    if (updatePostDto.images) post.images = updatePostDto.images;
    if (updatePostDto.videos) post.videos = updatePostDto.videos;
    if (updatePostDto.content !== undefined) post.content = updatePostDto.content;

    return this.repo.save(post);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Post not found');
  }
}
