import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment-service';
import { AccountService } from '../../services/account-service';
import { PaymentDTOResponse } from '../../models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-list-component.html',
  styleUrls: ['./payment-list-component.css']
})
export class PaymentListComponent implements OnInit {
  payments: PaymentDTOResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.paymentService.getAllPayments().subscribe({
      next: (data: PaymentDTOResponse[]) => {
        const rawPayments = Array.isArray(data) ? [...data] : [];
        this.payments = rawPayments;
        this.loading = false;
        this.cdr.markForCheck();

        // Recorremos cada pago para buscar los datos del titular usando el accountId
        rawPayments.forEach(payment => {
          if (payment.accountId) {
            this.accountService.getAccountById(payment.accountId).subscribe({
              next: (account: any) => {
                if (account) {
                  (payment as any).guestName = account.user?.name || account.name || '';
                  (payment as any).guestSurname = account.user?.surname || account.surname || '';
                  this.cdr.markForCheck();
                }
              },
              error: (err) => console.error(`Error al cargar cuenta #${payment.accountId}`, err)
            });
          }
        });
      },
      error: (err: any) => {
        this.errorMessage = 'No se pudieron cargar los pagos o no cuentas con los permisos necesarios.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}