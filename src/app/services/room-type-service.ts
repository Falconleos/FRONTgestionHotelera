import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomTypeDTOResponse, RoomTypeDTORequest } from '../models/room-type.model';

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService {
  private apiUrl = 'http://localhost:8080/private/room-type'; // Ajusta la URL base si es necesario

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // O la forma en que estés manejando tu token JWT
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAll(): Observable<RoomTypeDTOResponse[]> {
    return this.http.get<RoomTypeDTOResponse[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  getById(id: number): Observable<RoomTypeDTOResponse> {
    return this.http.get<RoomTypeDTOResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  createRoomType(request: RoomTypeDTORequest): Observable<RoomTypeDTOResponse> {
    return this.http.post<RoomTypeDTOResponse>(this.apiUrl, request, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  updateRoomType(id: number, request: RoomTypeDTORequest): Observable<RoomTypeDTOResponse> {
    return this.http.put<RoomTypeDTOResponse>(`${this.apiUrl}/${id}`, request, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  deleteRoomType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }
}