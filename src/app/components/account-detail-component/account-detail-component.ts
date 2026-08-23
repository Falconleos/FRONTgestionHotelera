import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account-service';
import { CheckInService } from '../../services/check-in-service';
import { RoomAttentionService } from '../../services/room-attention-service'; // Importamos el servicio de atenciones
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
    private roomAttentionService: RoomAttentionService, // Inyectamos el servicio
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('bookingId');
    if (idParam) {
      this.checkInId = +idParam;
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    // 1. Cargamos la cuenta y las atenciones de habitación en paralelo o secuencia
    this.accountService.getAccountByCheckInId(this.checkInId).subscribe({
      next: (accountData: AccountDTOResponse) => {
        this.account = accountData;
        
        // Sincronizamos el porcentaje que viene del backend
        this.adjustmentPercentage = accountData.adjustmentPercentage ?? 0;

        // 2. Buscamos los room services / atenciones usando el bookingId (que almacenamos en checkInId)
        this.roomAttentionService.getByBooking(this.checkInId).subscribe({
          next: (attentions) => {
            // Mapeamos las atenciones al formato de 'items' que espera la tabla del HTML
            if (this.account) {
              this.account.items = attentions.map(att => ({
                description: att.itemDTOResponse?.description || 'Room Service / Consumo',
                quantity: att.quantity,
                subtotal: att.subtotal
              }));
            }

            // Inicializamos los totales y pagos después de cargar los ítems
            this.adjustedTotal = this.calculateAdjustedTotal();
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
          error: (attErr) => {
            console.error('Error al cargar las atenciones de habitación:', attErr);
            // Aunque fallen las atenciones, mostramos la cuenta base
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err: any) => {
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
      next: (updatedAccount: AccountDTOResponse) => {
        this.account = updatedAccount;
        this.adjustmentPercentage = updatedAccount.adjustmentPercentage ?? this.adjustmentPercentage;
        this.adjustedTotal = this.calculateAdjustedTotal();
        this.paymentAmount = this.calculateRemaining();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        alert('Error al aplicar el porcentaje de ajuste.');
        console.error(err);
      }
    });
  }

  // Calcula el total general ajustado (Estadía base + Room Service + Porcentaje de ajuste)
  calculateAdjustedTotal(): number {
    if (!this.account) return 0;
    const rawTotal = this.calculateRawTotal();
    const adjustmentFactor = 1 + (this.adjustmentPercentage / 100);
    return rawTotal * adjustmentFactor;
  }

  // Calcula el restante restando todo el historial de pagos al total general ajustado
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
      error: (err: any) => {
        alert('Error al registrar el pago.');
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}