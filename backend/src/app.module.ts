import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';

import { User } from './users/user.entity';
import { Post } from './posts/post.entity';
import { Event } from './events/event.entity';
import { Comment } from './comments/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Post, Event, Comment],
      synchronize: true // dev only
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    EventsModule,
    CommentsModule,
  ],
})
export class AppModule {}
