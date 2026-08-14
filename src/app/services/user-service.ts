import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDtoResponse, UserDtoRequest } from '../models/user.model';
import { ChangePasswordDtoRequest } from '../models/change-password.model';
import { UserDtoRequestCreation } from '../models/user-creation.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/private/user';

  constructor(private http: HttpClient) {}

  // POST /private/user/change-password
  changePassword(request: ChangePasswordDtoRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request, { withCredentials: true });
  }

  // POST /private/user (Creación de usuario con rol)
  createUser(request: UserDtoRequestCreation): Observable<UserDtoResponse> {
    return this.http.post<UserDtoResponse>(this.apiUrl, request, { withCredentials: true });
  }

  // GET /private/user/{id}
  getById(id: number): Observable<UserDtoResponse> {
    return this.http.get<UserDtoResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // GET /private/user/dni/{dni}
  getByDni(dni: string): Observable<UserDtoResponse> {
    return this.http.get<UserDtoResponse>(`${this.apiUrl}/dni/${dni}`, { withCredentials: true });
  }

  // GET /private/user (Listar todos los usuarios)
  getAll(): Observable<UserDtoResponse[]> {
    return this.http.get<UserDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  // PUT /private/user/{id}
  updateUser(id: number, request: UserDtoRequest): Observable<UserDtoResponse> {
    return this.http.put<UserDtoResponse>(`${this.apiUrl}/${id}`, request, { withCredentials: true });
  }

  // DELETE /private/user/{id}
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}