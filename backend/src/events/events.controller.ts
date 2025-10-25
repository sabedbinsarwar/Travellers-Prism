import { Controller, Get, Post, Body, Param, Query, Delete, Put, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() body: UpdateEventDto
  ) {
    const eventId = Number(id);
    const userIdNum = Number(userId);

    if (isNaN(eventId) || isNaN(userIdNum)) {
      throw new BadRequestException('Invalid id or userId');
    }

    const updateData: Partial<Event> = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    };
    return this.eventsService.update(eventId, userIdNum, updateData);
  }

  @Post('join')
  join(@Body() data: { eventId: number; userId: number }) {
    return this.eventsService.joinEvent(data.eventId, data.userId);
  }

  @Get()
  all(@Query('userId') userId?: string) {
    if (userId) return this.eventsService.findByUser(Number(userId));
    return this.eventsService.all();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const eventId = Number(id);
    if (isNaN(eventId)) throw new BadRequestException('Invalid event id');
    return this.eventsService.findOne(eventId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    const eventId = Number(id);
    const userIdNum = Number(userId);

    if (isNaN(eventId) || isNaN(userIdNum)) {
      throw new BadRequestException('Invalid id or userId');
    }

    return this.eventsService.remove(eventId, userIdNum);
  }
}
