import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeDtoResponse } from '../models/employee.model';
import { EmployeeDtoRequest } from '../models/employee-request.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/private/employee';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeDtoResponse[]> {
    return this.http.get<EmployeeDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  createEmployee(request: EmployeeDtoRequest): Observable<EmployeeDtoResponse> {
    return this.http.post<EmployeeDtoResponse>(this.apiUrl, request, { withCredentials: true });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}