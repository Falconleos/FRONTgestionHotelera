import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountDTOResponse } from '../models/account.model';
import { PaymentDTORequest, PaymentDTOResponse } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/private/accounts';

  constructor(private http: HttpClient) {}

  getAllAccounts(): Observable<AccountDTOResponse[]> {
    return this.http.get<AccountDTOResponse[]>(this.apiUrl, { withCredentials: true });
  }

  getAccountById(id: number): Observable<AccountDTOResponse> {
    return this.http.get<AccountDTOResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getAccountByBookingId(bookingId: number): Observable<AccountDTOResponse> {
    return this.http.get<AccountDTOResponse>(`${this.apiUrl}/booking/${bookingId}`, { withCredentials: true });
  }

  // Método alias para resolver la llamada desde AccountDetailComponent
  getAccountByCheckInId(checkInId: number): Observable<AccountDTOResponse> {
    return this.getAccountByBookingId(checkInId);
  }

  updateAdjustmentPercentage(bookingId: number, adjustmentPercentage: number): Observable<AccountDTOResponse> {
    return this.http.put<AccountDTOResponse>(
      `${this.apiUrl}/booking/${bookingId}/adjustment`, 
      { adjustmentPercentage }, 
      { withCredentials: true }
    );
  }

  addPayment(request: PaymentDTORequest): Observable<PaymentDTOResponse> {
    return this.http.post<PaymentDTOResponse>(`${this.apiUrl}/payments`, request, { withCredentials: true });
  }

  getPaymentsByBookingId(bookingId: number): Observable<PaymentDTOResponse[]> {
    return this.http.get<PaymentDTOResponse[]>(`${this.apiUrl}/bookings/${bookingId}/payments`, { withCredentials: true });
  }
}