export class CreatePostDto {
  content?: string;
  images?: string[]; // URLs or filenames
  videos?: string[];
  userId: number;
}
