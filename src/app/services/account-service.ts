import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountDTOResponse } from '../models/account.model';
import { PaymentDTORequest, PaymentDTOResponse } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/api/accounts';

  constructor(private http: HttpClient) {}

  getAllAccounts(): Observable<AccountDTOResponse[]> {
    return this.http.get<AccountDTOResponse[]>(this.apiUrl, { withCredentials: true });
  }

  getAccountById(id: number): Observable<AccountDTOResponse> {
    return this.http.get<AccountDTOResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  addPayment(request: PaymentDTORequest): Observable<PaymentDTOResponse> {
    return this.http.post<PaymentDTOResponse>(`${this.apiUrl}/payments`, request, { withCredentials: true });
  }

  getAccountByCheckInId(checkInId: number): Observable<AccountDTOResponse> {
    return this.http.get<AccountDTOResponse>(`${this.apiUrl}/check-in/${checkInId}`, { withCredentials: true });
  }

  updateAdjustmentPercentage(checkInId: number, adjustmentPercentage: number): Observable<AccountDTOResponse> {
    return this.http.put<AccountDTOResponse>(
      `${this.apiUrl}/check-in/${checkInId}/adjustment`, 
      { adjustmentPercentage }, 
      { withCredentials: true }
    );
  }
}