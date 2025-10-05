import { Controller, Post as HttpPost, Body, Get, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @HttpPost()
  async create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Get()
  async list(@Query('postId') postId: string, @Query('eventId') eventId: string) {
    if (postId) return this.commentsService.findByPost(parseInt(postId));
    if (eventId) return this.commentsService.findByEvent(parseInt(eventId));
    return [];
  }
}
