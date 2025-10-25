import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
import { Like } from '../likes/like.entity';
import { Event } from '../events/event.entity'; // ✅ import this

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  profilePic: string;

  @Column({ nullable: true })
  coverPic: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  // ✅ add these relations for events
  @OneToMany(() => Event, (event) => event.creator)
  createdEvents: Event[];

  @ManyToMany(() => Event, (event) => event.participants)
  joinedEvents: Event[];
}
