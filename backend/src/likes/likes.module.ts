import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), UsersModule, PostsModule],
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikesModule {}
