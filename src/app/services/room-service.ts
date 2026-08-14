import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomDtoResponse } from '../models/room.model';
import { RoomDTORequest } from '../models/room-request.model'; // Asegúrate de crear este modelo

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/private/room';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoomDtoResponse[]> {
    return this.http.get<RoomDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  createRoom(request: RoomDTORequest): Observable<RoomDtoResponse> {
    return this.http.post<RoomDtoResponse>(this.apiUrl, request, { withCredentials: true });
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}