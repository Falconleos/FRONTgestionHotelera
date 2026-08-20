import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomDtoResponse } from '../models/room.model';
import { RoomDTORequest } from '../models/room-request.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/private/room';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoomDtoResponse[]> {
    return this.http.get<RoomDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  // Actualizado para enviar FormData cuando hay archivos adjuntos
  createRoom(request: RoomDTORequest, images?: File[]): Observable<RoomDtoResponse> {
    const formData = new FormData();
    formData.append('number', request.number.toString());
    formData.append('roomTypeId', request.roomTypeId.toString());
    
    if (request.state) {
      formData.append('state', request.state);
    }

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file, file.name);
      });
    }

    return this.http.post<RoomDtoResponse>(this.apiUrl, formData, { withCredentials: true });
  }

  // Nuevo método para agregar imágenes a una habitación existente
  addImages(roomId: number, images: File[]): Observable<RoomDtoResponse> {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append('images', file, file.name);
    });

    return this.http.post<RoomDtoResponse>(`${this.apiUrl}/${roomId}/images`, formData, { withCredentials: true });
  }

  // Nuevo método para recuperar una imagen específica en formato Blob (binario)
  getRoomImage(roomId: number, index: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${roomId}/images/${index}`, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getRoomImageBlob(roomId: number, index: number): Observable<Blob> {
  return this.http.get(`http://localhost:8080/private/room/${roomId}/images/${index}`, {
    responseType: 'blob'
  });
}

}