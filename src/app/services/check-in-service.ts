import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckInDtoResponse } from '../models/check-in.model';
import { BookingDtoResponse } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private apiUrl = 'http://localhost:8080/api/check-ins';
  private usersUrl = 'http://localhost:8080/api/users';
  private bookingsUrl = 'http://localhost:8080/private/booking';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<CheckInDtoResponse[]> {
    return this.http.get<CheckInDtoResponse[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getTodayCheckIns(): Observable<BookingDtoResponse[]> {
    return this.http.get<BookingDtoResponse[]>(`${this.bookingsUrl}/today-checkins`, { headers: this.getAuthHeaders() });
  }

  getBookingById(id: number): Observable<BookingDtoResponse> {
    return this.http.get<BookingDtoResponse>(`${this.bookingsUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getBookingsByState(state: string): Observable<BookingDtoResponse[]> {
    return this.http.get<BookingDtoResponse[]>(`${this.bookingsUrl}/state/${state}`, { headers: this.getAuthHeaders() });
  }

  createCheckIn(request: any): Observable<any> {
    return this.http.post(this.apiUrl, request, { headers: this.getAuthHeaders() });
  }

  getMyCheckIns(): Observable<CheckInDtoResponse[] > {
    return this.http.get<CheckInDtoResponse[]>(`${this.apiUrl}/my-check-ins`, { headers: this.getAuthHeaders() });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl, { headers: this.getAuthHeaders() });
  }

  checkInBooking(bookingId: number, dni?: string): Observable<BookingDtoResponse> {
    let params = new HttpParams();
    if (dni) {
      params = params.set('dni', dni);
    }
    return this.http.patch<BookingDtoResponse>(`${this.bookingsUrl}/${bookingId}/check-in`, {}, { 
      headers: this.getAuthHeaders(),
      params: params 
    });
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(this.usersUrl, userData, { headers: this.getAuthHeaders() });
  }

  assignUserToBooking(bookingId: number, userId: number): Observable<BookingDtoResponse> {
    return this.http.patch<BookingDtoResponse>(`${this.bookingsUrl}/${bookingId}/assign-user/${userId}`, {}, { headers: this.getAuthHeaders() });
  }

  interruptStay(id: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/interrupt`, { reason }, { headers: this.getAuthHeaders() });
  }

  // --- NUEVO MÉTODO PARA CHECK-IN POR QR ---
  checkInByQr(qrCode: string): Observable<BookingDtoResponse> {
    const params = new HttpParams().set('qrCode', qrCode);
    return this.http.post<BookingDtoResponse>(`${this.bookingsUrl}/check-in/qr`, {}, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }
}