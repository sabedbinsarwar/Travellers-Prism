import { Controller, Post as HttpPost, Body, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @HttpPost()
  async create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get()
  async all() {
    return this.postsService.all();
  }
}
