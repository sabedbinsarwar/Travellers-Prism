export class CreateCommentDto {
  userId: number;
  postId?: number;
  eventId?: number;
  content: string;
}
