import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDtoResponse } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/private/comments';

  constructor(private http: HttpClient) {}

  // Para Admin y Recepcionista (lista todo)
  getAll(): Observable<CommentDtoResponse[]> {
    return this.http.get<CommentDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  // Para el Huésped (lista solo sus comentarios)
  getMyComments(): Observable<CommentDtoResponse[]> {
    return this.http.get<CommentDtoResponse[]>(`${this.apiUrl}/my-comments`, { withCredentials: true });
  }

  getByCheckIn(checkInId: number): Observable<CommentDtoResponse[]> {
    return this.http.get<CommentDtoResponse[]>(`${this.apiUrl}/check-in/${checkInId}`, { withCredentials: true });
  }

  create(comment: any): Observable<CommentDtoResponse> {
    return this.http.post<CommentDtoResponse>(this.apiUrl, comment, { withCredentials: true });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { withCredentials: true });
  }
}