// src/app/services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeDtoResponse } from '../models/employee.model';
import { EmployeeCreateUnifiedDTO } from '../models/employee-create-unified.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/private/employee';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeDtoResponse[]> {
    return this.http.get<EmployeeDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  // Petición unificada para crear usuario y empleado de un solo golpe usando FormData
  createEmployee(request: EmployeeCreateUnifiedDTO): Observable<EmployeeDtoResponse> {
    const formData = new FormData();

    Object.keys(request).forEach(key => {
      const value = (request as any)[key];
      
      // Validamos que no sea nulo, indefinido ni un string vacío
      if (value !== null && value !== undefined && value !== '') {
        // Si el campo es el archivo de la foto de perfil y es un File válido
        if (key === 'profilePictureFile' && value instanceof File) {
          formData.append(key, value, value.name);
        } else if (!(value instanceof File)) {
          // Para campos de texto, números o fechas, aseguramos que se envíen como string limpio
          formData.append(key, value.toString());
        }
      }
    });

    return this.http.post<EmployeeDtoResponse>(this.apiUrl, formData, { withCredentials: true });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}