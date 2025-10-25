import { Injectable } from '@nestjs/common'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '../users/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // fetch all events for newsfeed
  async all() {
    return this.repo.find({
      relations: ['creator', 'participants'],
      order: { createdAt: 'DESC' },
    });
  }

  // fetch only events created by a specific user
  async findByUser(userId: number) {
    return this.repo.find({
      where: { creator: { id: userId } },
      relations: ['creator', 'participants'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['creator', 'participants'],
    });
  }

  async create(dto: CreateEventDto) {
    const user = await this.userRepo.findOneBy({ id: dto.creatorId });
    if (!user) throw new Error('Creator not found');

    const event = this.repo.create({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      date: new Date(dto.date),
      creator: user,
      participants: [user],
    });

    return this.repo.save(event);
  }

  async update(eventId: number, userId: number, data: Partial<Event>) {
    const event = await this.repo.findOne({
      where: { id: eventId },
      relations: ['creator'],
    });
    if (!event) throw new Error('Event not found');
    if (event.creator.id !== userId) throw new Error('Not authorized');

    Object.assign(event, {
      title: data.title ?? event.title,
      description: data.description ?? event.description,
      location: data.location ?? event.location,
      date: data.date ?? event.date,
    });

    return this.repo.save(event);
  }

  async joinEvent(eventId: number, userId: number) {
    const event = await this.repo.findOne({
      where: { id: eventId },
      relations: ['participants'],
    });
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!event || !user) throw new Error('Event or user not found');

    if (!event.participants.some((u) => u.id === user.id)) {
      event.participants.push(user);
    }

    return this.repo.save(event);
  }

 async remove(eventId: number, userId: number) {
  const event = await this.repo.findOne({
    where: { id: eventId },
    relations: ['creator'],
  });

  // If event doesn't exist, just return a message
  if (!event) return { message: 'Event already deleted' };

  // Check authorization
  if (event.creator.id !== userId) throw new Error('Not authorized');

  await this.repo.remove(event);
  return { message: 'Event deleted successfully' };
}

}
