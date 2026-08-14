import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckInDtoResponse } from '../models/check-in.model';
import { BookingDtoResponse } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private apiUrl = 'http://localhost:8080/private/check-in';
  private bookingApiUrl = 'http://localhost:8080/private/booking';
  private userApiUrl = 'http://localhost:8080/private/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CheckInDtoResponse[]> {
    return this.http.get<CheckInDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  getMyCheckIns(): Observable<CheckInDtoResponse[]> {
    return this.http.get<CheckInDtoResponse[]>(`${this.apiUrl}/my-check-ins`, { withCredentials: true });
  }

  getTodayCheckIns(): Observable<BookingDtoResponse[]> {
    return this.http.get<BookingDtoResponse[]>(`${this.bookingApiUrl}/today-checkins`, { withCredentials: true });
  }

  getBookingById(id: number): Observable<BookingDtoResponse> {
    return this.http.get<BookingDtoResponse>(`${this.bookingApiUrl}/${id}`, { withCredentials: true });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.userApiUrl, { withCredentials: true });
  }

  createCheckIn(request: { bookingId: number; userId: number }): Observable<CheckInDtoResponse> {
    return this.http.post<CheckInDtoResponse>(this.apiUrl, request, { withCredentials: true });
  }

  interruptStay(id: number, reason: string): Observable<CheckInDtoResponse> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<CheckInDtoResponse>(`${this.apiUrl}/${id}/interrupt`, null, { params, withCredentials: true });
  }
}