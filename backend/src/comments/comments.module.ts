import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module'; // ✅ add this line

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UsersModule,
    PostsModule, // ✅ import PostsModule here
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
