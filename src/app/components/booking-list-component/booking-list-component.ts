import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { BookingDtoResponse } from '../../models/booking.model';
import { PaymentDTOResponse } from '../../models/payment.model'; 
import { AuthService } from '../../services/auth-service';
import { AccountService } from '../../services/account-service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking-list-component.html',
  styleUrls: ['./booking-list-component.css']
})
export class BookingListComponent implements OnInit {
  bookings: BookingDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  canModify = false;

  selectedBookingForPayment: BookingDtoResponse | null = null;
  bookingPayments: PaymentDTOResponse[] = [];
  loadingPayments = false;
  
  newPaymentAmount: number | null = null;
  newPaymentMethod: string = 'CASH';
  newPaymentReference: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadBookings();
  }

  checkUserRole(): void {
    const storedRoles = localStorage.getItem('role');
    if (storedRoles) {
      try {
        const roles = JSON.parse(storedRoles);
        if (Array.isArray(roles)) {
          this.canModify = roles.some((r: any) => {
            const val = typeof r === 'string' ? r : (r.authority || '');
            return val === 'ADMIN' || val === 'ROLE_ADMIN' || val === 'RECEPCIONIST' || val === 'ROLE_RECEPCIONIST';
          });
        } else {
          const val = typeof roles === 'string' ? roles : '';
          this.canModify = val === 'ADMIN' || val === 'ROLE_ADMIN' || val === 'RECEPCIONIST' || val === 'ROLE_RECEPCIONIST';
        }
      } catch (e) {
        this.canModify = storedRoles.includes('ADMIN') || storedRoles.includes('RECEPCIONIST');
      }
    } else {
      this.canModify = false;
    }
  }

  loadBookings(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.bookingService.getAll().subscribe({
      next: (data) => {
        const allBookings = Array.isArray(data) ? [...data] : [];
        
        // Filtramos para mostrar únicamente las que están activas o en estados válidos de gestión
        this.bookings = allBookings.filter(
          (b) => b.state === 'PENDING' || b.state === 'CONFIRMED'
          // O de forma más estricta, excluyendo las concluidas/canceladas:
          // b.state !== 'CANCELLED' && b.state !== 'NO_SHOW' && b.state !== 'CONCLUDED' && b.state !== 'INTERRUPTED'
        );
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar las reservas o no cuentas con los permisos necesarios.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  cancelBooking(id: number): void {
    if (!this.canModify) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      return;
    }

    const reason = prompt('Por favor, ingrese el motivo de la cancelación:');
    if (reason === null) {
      return; // El usuario canceló la acción
    }

    // 1. Primero consultamos la cuenta de la reserva para ver si tiene pagos
    this.accountService.getAccountByBookingId(id).subscribe({
      next: (account: any) => {
        // Verificamos si la cuenta tiene pagos realizados (paidAmount > 0 o listado de pagos)
        const hasPayments = account && account.paidAmount > 0;
        
        let issueCreditNote = false;

        // 2. Solo si tiene pagos, le preguntamos al usuario si desea emitir la nota de crédito
        if (hasPayments) {
          issueCreditNote = confirm('Esta reserva cuenta con pagos registrados. ¿Desea emitir una nota de crédito/reintegro?');
        }

        const userIdStr = localStorage.getItem('userId');
        const userId = userIdStr ? Number(userIdStr) : 1;

        const request = {
          bookingId: id,
          reason: reason.trim(),
          userId: userId,
          issueCreditNote: issueCreditNote
        };

        // 3. Ejecutamos la cancelación enviando el request
        this.bookingService.cancelBooking(request).subscribe({
          next: () => {
            alert(`Reserva ID ${id} cancelada exitosamente.`);
            this.loadBookings();
          },
          error: (err) => {
            alert('Error al intentar cancelar la reserva.');
            console.error(err);
          }
        });
      },
      error: (err) => {
        // Si por alguna razón no se encuentra la cuenta, permitimos continuar con la cancelación estándar sin nota de crédito
        console.warn('No se pudo obtener la cuenta para validar pagos, procediendo a cancelar...', err);
        
        const userIdStr = localStorage.getItem('userId');
        const userId = userIdStr ? Number(userIdStr) : 1;

        const request = {
          bookingId: id,
          reason: reason.trim(),
          userId: userId,
          issueCreditNote: false
        };

        this.bookingService.cancelBooking(request).subscribe({
          next: () => {
            alert(`Reserva ID ${id} cancelada exitosamente.`);
            this.loadBookings();
          },
          error: (errBooking) => {
            alert('Error al intentar cancelar la reserva.');
            console.error(errBooking);
          }
        });
      }
    });
  }

  confirmBooking(id: number): void {
    if (!this.canModify) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      return;
    }

    this.bookingService.confirmBooking(id).subscribe({
      next: () => {
        alert(`Reserva ID ${id} confirmada exitosamente.`);
        this.loadBookings();
      },
      error: (err) => {
        alert('Error al intentar confirmar la reserva.');
        console.error(err);
      }
    });
  }

  openPaymentModal(booking: BookingDtoResponse): void {
    this.selectedBookingForPayment = booking;
    this.loadBookingPayments(booking.id);
  }

  closePaymentModal(): void {
    this.selectedBookingForPayment = null;
    this.bookingPayments = [];
    this.newPaymentAmount = null;
    this.newPaymentReference = '';
  }

  loadBookingPayments(bookingId: number): void {
    this.loadingPayments = true;
    
    // CORREGIDO: Usamos accountService que es donde vive esta llamada
    this.accountService.getPaymentsByBookingId(bookingId).subscribe({
      next: (payments) => {
        this.bookingPayments = Array.isArray(payments) ? payments : [];
        this.loadingPayments = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar el historial de señas:', err);
        this.bookingPayments = [];
        this.loadingPayments = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitBookingPayment(): void {
    if (!this.selectedBookingForPayment || !this.newPaymentAmount || this.newPaymentAmount <= 0) {
      alert('Por favor, ingresa un monto válido.');
      return;
    }

    const bookingId = this.selectedBookingForPayment.id;

    this.accountService.getAccountByBookingId(bookingId).subscribe({
      next: (account: any) => {
        const request = {
          accountId: account.id,
          amount: this.newPaymentAmount!,
          paymentMethod: this.newPaymentMethod,
          transactionReference: this.newPaymentReference.trim()
        };

        this.accountService.addPayment(request).subscribe({
          next: () => {
            alert('Seña registrada exitosamente.');
            this.loadBookingPayments(bookingId);
            this.newPaymentAmount = null;
            this.newPaymentReference = '';
          },
          error: (err: any) => {
            alert('Error al registrar la seña.');
            console.error(err);
          }
        });
      },
      error: (err: any) => {
        alert('No se pudo encontrar la cuenta asociada a esta reserva.');
        console.error(err);
      }
    });
  }
}