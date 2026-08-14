import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingDtoResponse, BookingCancellationDtoRequest } from '../models/booking.model';
import { PaymentDTORequest, PaymentDTOResponse } from '../models/payment.model';
import { RoomDtoResponse } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/private/booking';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BookingDtoResponse[]> {
    return this.http.get<BookingDtoResponse[]>(this.apiUrl, { withCredentials: true });
  }

  getAvailableRooms(checkIn: string, checkOut: string, guestCount: number): Observable<RoomDtoResponse[]> {
    return this.http.get<RoomDtoResponse[]>(`${this.apiUrl}/available-rooms/${checkIn}/${checkOut}/${guestCount}`, {
      withCredentials: true
    });
  }

  createBooking(request: any): Observable<BookingDtoResponse> {
    return this.http.post<BookingDtoResponse>(this.apiUrl, request, { withCredentials: true });
  }

  confirmBooking(id: number): Observable<BookingDtoResponse> {
    return this.http.patch<BookingDtoResponse>(`${this.apiUrl}/${id}/confirm`, {}, { withCredentials: true });
  }

  cancelBooking(request: BookingCancellationDtoRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cancel`, request, { withCredentials: true });
  }

  // --- NUEVOS MÉTODOS PARA SEÑAS DE RESERVAS ---

  addPaymentToBooking(request: PaymentDTORequest): Observable<PaymentDTOResponse> {
    return this.http.post<PaymentDTOResponse>('http://localhost:8080/api/accounts/bookings/payments', request, { withCredentials: true });
  }

  getPaymentsByBookingId(bookingId: number): Observable<PaymentDTOResponse[]> {
    return this.http.get<PaymentDTOResponse[]>(`http://localhost:8080/api/accounts/bookings/${bookingId}/payments`, { withCredentials: true });
  }

}