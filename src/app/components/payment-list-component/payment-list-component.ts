import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment-service';
import { PaymentDTOResponse } from '../../models/payment.model'; // <-- Corregido aquí

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-list-component.html',
  styleUrls: ['./payment-list-component.css']
})
export class PaymentListComponent implements OnInit {
  payments: PaymentDTOResponse[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
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
        this.payments = Array.isArray(data) ? [...data] : [];
        this.loading = false;
        this.cdr.markForCheck();
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