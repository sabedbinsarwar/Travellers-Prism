import { Controller, Get, Post as HttpPost, Body, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @HttpPost()
  async create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  async all(@Query('location') location: string) {
    if (location) return this.eventsService.findByLocation(location);
    return this.eventsService.all();
  }

  @HttpPost('join')
  async join(@Body() body: { eventId: number; userId: number }) {
    return this.eventsService.join(body.eventId, body.userId);
  }
}
