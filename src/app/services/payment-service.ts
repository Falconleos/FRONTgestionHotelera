import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AccountService } from './account-service';
import { PaymentDTOResponse } from '../models/payment.model';
import { AccountDTOResponse } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private accountService: AccountService) {}

  getAllPayments(): Observable<PaymentDTOResponse[]> {
    return this.accountService.getAllAccounts().pipe(
      map((accounts: AccountDTOResponse[]) => {
        const allPayments: PaymentDTOResponse[] = [];
        accounts.forEach((account: AccountDTOResponse) => {
          if (account.payments) {
            account.payments.forEach((payment: PaymentDTOResponse) => {
              allPayments.push(payment);
            });
          }
        });
        return allPayments;
      })
    );
  }
}