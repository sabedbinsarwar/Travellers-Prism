export class CreateEventDto {
  title: string;
  description: string;
  location: string;
  date: string; // ISO string
  creatorId: number;
  images?: string[];
}
