import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './post.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService], // ✅ export so other modules can use it
})
export class PostsModule {}
