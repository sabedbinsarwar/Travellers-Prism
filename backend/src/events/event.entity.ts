import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column()
  date: Date; // user-selected event date

  @CreateDateColumn() // auto upload timestamp
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.createdEvents)
  creator: User;

  @ManyToMany(() => User, (user) => user.joinedEvents, { eager: false })
  @JoinTable()
  participants: User[];
}
