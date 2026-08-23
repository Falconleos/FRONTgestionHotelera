export interface CommentDtoResponse {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  name: string;
  surname: string;
  username: string;
}

export interface CommentDtoRequest {
  content: string;
  rating: number;
}