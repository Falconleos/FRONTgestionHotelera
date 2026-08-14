import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomAttentionDtoRequest, RoomAttentionDtoResponse } from '../models/room-attention.model';

@Injectable({
  providedIn: 'root'
})
export class RoomAttentionService {
  private apiUrl = 'http://localhost:8080/private/room-attentions'; // Ajusta la URL base si es necesario

  constructor(private http: HttpClient) {}

  getByCheckIn(checkInId: number): Observable<RoomAttentionDtoResponse[]> {
    return this.http.get<RoomAttentionDtoResponse[]>(`${this.apiUrl}/check-in/${checkInId}`);
  }

  addAttention(request: RoomAttentionDtoRequest): Observable<RoomAttentionDtoResponse> {
    return this.http.post<RoomAttentionDtoResponse>(this.apiUrl, request);
  }

  deleteAttention(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}