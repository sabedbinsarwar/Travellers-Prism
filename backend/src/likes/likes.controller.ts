import { Controller, Post as NestPost, Body } from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @NestPost()
  async toggle(@Body() body: any) {
    const { userId, postId } = body;
    return this.likesService.toggle(parseInt(userId), parseInt(postId));
  }
}
