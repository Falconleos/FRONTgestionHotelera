import { UserDtoResponse } from './user.model';

export interface CommentDtoResponse {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  checkInId: number;
  user: UserDtoResponse;
}