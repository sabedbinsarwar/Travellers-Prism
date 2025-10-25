export class CreateEventDto {
  title: string;
  description: string;
  location: string;
  date: string; // from datetime-local input
  creatorId: number;
}
