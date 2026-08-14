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

  createItem(request: ItemDtoRequest): Observable<ItemDtoResponse> {
    return this.http.post<ItemDtoResponse>(this.apiUrl, request, { withCredentials: true });
  }

  updateItem(id: number, request: ItemDtoRequest): Observable<ItemDtoResponse> {
    return this.http.put<ItemDtoResponse>(`${this.apiUrl}/${id}`, request, { withCredentials: true });
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}