import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  // POST /private/user (Creación de usuario con rol y foto de perfil opcional)
  createUser(request: UserDtoRequestCreation): Observable<UserDtoResponse> {
    const formData = new FormData();

    // Recorremos todas las propiedades del objeto y las agregamos al FormData
    Object.keys(request).forEach(key => {
      const value = (request as any)[key];
      
      // Verificamos que el valor no sea nulo o indefinido antes de agregarlo
      if (value !== null && value !== undefined) {
        // Si es el archivo de la foto, lo agregamos directamente como File
        if (key === 'profilePictureFile' && value instanceof File) {
          formData.append(key, value, value.name);
        } else {
          // Para los demás campos de texto, números o enums, los convertimos a string
          formData.append(key, value.toString());
        }
      }
    });

    // Nota: HttpClient detecta automáticamente el FormData y establece el Content-Type como multipart/form-data
    return this.http.post<UserDtoResponse>(this.apiUrl, formData, { withCredentials: true });
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

  getByRole(roleName: string): Observable<UserDtoResponse[]> {
  return this.http.get<UserDtoResponse[]>(`${this.apiUrl}/role/${roleName}`, { headers: this.getHeaders() });
}

private getHeaders(): HttpHeaders {
  const token = localStorage.getItem('token'); // O la clave con la que guardas tu JWT en el storage
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });
}

// GET /private/user/{id}/profile-picture
  getProfilePicture(id: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${id}/profile-picture`, {
    headers: this.getHeaders(), // Asegura que use las cabeceras con el Token
    responseType: 'blob'
  });
}

  getUserByUsername(username: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/username/${username}`);
}

}