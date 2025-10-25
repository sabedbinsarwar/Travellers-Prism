import { Controller, Post as NestPost, Body, Get, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @NestPost()
  async create(@Body() body: any) {
    const { userId, postId, content } = body;
    return this.commentsService.create(parseInt(userId), parseInt(postId), content);
  }

  @Get('post/:postId')
  async forPost(@Param('postId') postId: string) {
    return this.commentsService.findByPostId(parseInt(postId));
  }
}
