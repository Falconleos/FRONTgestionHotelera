import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account-service';
import { CheckInService } from '../../services/check-in-service';
import { AccountDTOResponse } from '../../models/account.model';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-detail-component.html',
  styleUrls: ['./account-detail-component.css']
})
export class AccountDetailComponent implements OnInit {
  checkInId!: number;
  account?: AccountDTOResponse;
  checkInState: string = '';
  loading = true;
  errorMessage = '';

  // Formulario de pago
  paymentAmount: number = 0;
  paymentMethod: string = 'CASH';
  transactionReference: string = '';

  // Único ajuste por porcentaje (positivo para recargo, negativo para descuento)
  adjustmentPercentage: number = 0;

  // Total que se actualiza al aplicar el ajuste
  adjustedTotal: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private checkInService: CheckInService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('checkInId');
    if (idParam) {
      this.checkInId = +idParam;
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getAccountByCheckInId(this.checkInId).subscribe({
      next: (accountData) => {
        this.account = accountData;
        
        // Sincronizamos el porcentaje que viene del backend
        this.adjustmentPercentage = accountData.adjustmentPercentage ?? 0;
        
        // Inicializamos los totales
        this.adjustedTotal = accountData.totalAmount;
        this.paymentAmount = this.calculateRemaining();

        // Obtenemos el check-in para conocer su estado actual
        this.checkInService.getAll().subscribe({
          next: (checkIns) => {
            const currentCheckIn = checkIns.find(c => c.id === this.checkInId);
            if (currentCheckIn) {
              this.checkInState = currentCheckIn.checkInState;
            }
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el resumen de la cuenta.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  // Calcula la suma bruta (Estadía base + ítems) sin porcentajes
  calculateRawTotal(): number {
    if (!this.account) return 0;
    const base = this.account.baseAmount ?? 0;
    const itemsTotal = this.account.items ? this.account.items.reduce((acc, item) => acc + item.subtotal, 0) : 0;
    return base + itemsTotal;
  }

  // Calcula el monto exacto en dinero que representa el ajuste (positivo o negativo)
  calculateAdjustmentAmount(): number {
    const rawTotal = this.calculateRawTotal();
    return rawTotal * (this.adjustmentPercentage / 100);
  }

  // Se ejecuta al hacer clic en el botón "Aplicar"
  applyAdjustments(): void {
    if (!this.account || this.account.isPaid) return;

    this.accountService.updateAdjustmentPercentage(this.checkInId, this.adjustmentPercentage).subscribe({
      next: (updatedAccount) => {
        this.account = updatedAccount;
        this.adjustedTotal = updatedAccount.totalAmount;
        this.paymentAmount = this.calculateRemaining();
        this.cdr.markForCheck();
      },
      error: (err) => {
        alert('Error al aplicar el porcentaje de ajuste.');
        console.error(err);
      }
    });
  }

  calculateAdjustedTotal(): number {
    return this.account ? this.account.totalAmount : this.adjustedTotal;
  }

  calculateRemaining(): number {
    if (!this.account) return 0;
    const totalPaid = this.account.payments ? this.account.payments.reduce((acc, p) => acc + p.amount, 0) : 0;
    return Math.max(0, this.calculateAdjustedTotal() - totalPaid);
  }

  submitPayment(): void {
    if (!this.account || this.paymentAmount <= 0 || this.account.isPaid) return;

    const paymentPayload = {
      accountId: this.account.id,
      amount: this.paymentAmount,
      paymentMethod: this.paymentMethod,
      transactionReference: this.transactionReference || 'Pago en mostrador'
    };

    this.accountService.addPayment(paymentPayload).subscribe({
      next: () => {
        this.paymentAmount = 0;
        this.transactionReference = '';
        this.loadData();
      },
      error: (err) => {
        alert('Error al registrar el pago.');
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}