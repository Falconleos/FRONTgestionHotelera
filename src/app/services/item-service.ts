import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemDtoResponse, ItemDtoRequest } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:8080/private/items';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ItemDtoResponse[]> {
    return this.http.get<ItemDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  getById(id: number): Observable<ItemDtoResponse> {
    return this.http.get<ItemDtoResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createItem(request: ItemDtoRequest, image?: File): Observable<ItemDtoResponse> {
    const formData = new FormData();
    formData.append('item', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) {
      formData.append('file', image);
    }
    return this.http.post<ItemDtoResponse>(this.apiUrl, formData, { withCredentials: true });
  }

  updateItem(id: number, request: ItemDtoRequest, image?: File): Observable<ItemDtoResponse> {
    const formData = new FormData();
    formData.append('item', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) {
      formData.append('file', image);
    }
    return this.http.put<ItemDtoResponse>(`${this.apiUrl}/${id}`, formData, { withCredentials: true });
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Nuevo método para obtener la imagen como blob binario
  getItemImage(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/image`, { 
      responseType: 'blob', 
      withCredentials: true 
    });
  }
}