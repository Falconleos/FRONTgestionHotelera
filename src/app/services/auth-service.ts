import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginDtoRequest, AuthTokenResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/public/auth'; // Ajusta según tu environment

  constructor(private http: HttpClient) {}

  login(credentials: UserLoginDtoRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  refreshToken(): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true });
  }

  /**
   * Retorna la URL pública de la foto de perfil basada en el ID del usuario
   */
  getProfilePictureUrl(userId: number): string {
    return `${this.apiUrl}/${userId}/profile-picture`;
  }

  /**
   * Obtiene el ID numérico del usuario a partir de su username utilizando el endpoint público
   */
  getUserIdByUsername(username: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/by-username/${username}`);
  }

}