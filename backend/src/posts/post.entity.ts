import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';
import { Like } from '../likes/like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content: string;

@Column({ type: 'simple-array', nullable: true })
images: string[]; // multiple image filenames

@Column({ type: 'simple-array', nullable: true })
videos: string[]; // multiple video filenames

  @ManyToOne(() => User, (user) => user.posts, { nullable: false, eager: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
