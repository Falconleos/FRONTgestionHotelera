import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDtoResponse, CommentDtoRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/private/comments';

  constructor(private http: HttpClient) {}

  // Lista todos los comentarios (Admin/Recepcionista) o los propios (Guest) según lógica del backend
  getAll(): Observable<CommentDtoResponse[]> {
    return this.http.get<CommentDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  // Lista explícitamente los comentarios propios del usuario logueado
  getMyComments(): Observable<CommentDtoResponse[]> {
    return this.http.get<CommentDtoResponse[]>(`${this.apiUrl}/my-comments`, { withCredentials: true });
  }

  // Crear comentario (ya no requiere checkInId, solo content y rating)
  create(comment: CommentDtoRequest): Observable<CommentDtoResponse> {
    return this.http.post<CommentDtoResponse>(this.apiUrl, comment, { withCredentials: true });
  }

  // Actualizar comentario
  update(id: number, payload: CommentDtoRequest): Observable<CommentDtoResponse> {
    return this.http.put<CommentDtoResponse>(`${this.apiUrl}/${id}`, payload, { withCredentials: true });
  }

  // Eliminar comentario
  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}