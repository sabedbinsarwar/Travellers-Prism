import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ nullable: true })
  postId: number;

  @Column({ nullable: true })
  eventId: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
