import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsService {
  constructor(@InjectRepository(Event) private repo: Repository<Event>, private usersService: UsersService) {}

  async create(dto: CreateEventDto) {
    const user = await this.usersService.findById(dto.creatorId);
if (!user) throw new Error('Creator not found');
    const e = this.repo.create({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      date: new Date(dto.date),
      creator: user,
      images: dto.images || [],
      participants: [],
    });
    return this.repo.save(e);
  }

  async all() {
    return this.repo.find({ order: { date: 'ASC' } });
  }

  async findByLocation(loc: string) {
    return this.repo.find({ where: { location: Like(`%${loc}%`) }, order: { date: 'ASC' } });
  }

  async join(eventId: number, userId: number) {
    const e = await this.repo.findOne({ where: { id: eventId } });
    if (!e) return null;
    e.participants = e.participants || [];
    if (!e.participants.includes(userId)) e.participants.push(userId);
    return this.repo.save(e);
  }
}
