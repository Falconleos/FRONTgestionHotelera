import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANTE para [(ngModel)]
import { RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { BookingDtoResponse } from '../../models/booking.model';
import { PaymentDTOResponse } from '../../models/payment.model'; // <--- Import del modelo de pago
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // <--- Añadido FormsModule aquí
  templateUrl: './booking-list-component.html',
  styleUrls: ['./booking-list-component.css']
})
export class BookingListComponent implements OnInit {
  bookings: BookingDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  canModify = false; // Permite acceso a Admin y Recepcionista

  // --- PROPIEDADES PARA GESTIÓN DE SEÑAS ---
  selectedBookingForPayment: BookingDtoResponse | null = null;
  bookingPayments: PaymentDTOResponse[] = [];
  loadingPayments = false;
  
  newPaymentAmount: number | null = null;
  newPaymentMethod: string = 'CASH';
  newPaymentReference: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
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
        // Filtramos solo las que están en PENDING o CONFIRMED
        this.bookings = allBookings.filter(
          (b) => b.state === 'PENDING' || b.state === 'CONFIRMED'
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
      return; // El usuario canceló el prompt
    }

    const request = {
      bookingId: id,
      reason: reason.trim()
    };

    this.bookingService.cancelBooking(request).subscribe({
      next: () => {
        alert(`Reserva ID ${id} cancelada exitosamente.`);
        this.loadBookings(); // Recarga la lista para reflejar los cambios
      },
      error: (err) => {
        alert('Error al intentar cancelar la reserva.');
        console.error(err);
      }
    });
  }

  confirmBooking(id: number): void {
    if (!this.canModify) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      return;
    }

    this.bookingService.confirmBooking(id).subscribe({
      next: (updatedBooking) => {
        alert(`Reserva ID ${id} confirmada exitosamente.`);
        this.loadBookings();
      },
      error: (err) => {
        alert('Error al intentar confirmar la reserva.');
        console.error(err);
      }
    });
  }

  // --- MÉTODOS PARA GESTIÓN DE SEÑAS ---

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
    this.bookingService.getPaymentsByBookingId(bookingId).subscribe({
      next: (payments) => {
        this.bookingPayments = payments;
        this.loadingPayments = false;
        this.cdr.markForCheck();
      },
      error: () => {
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

    const request = {
      bookingId: this.selectedBookingForPayment.id,
      amount: this.newPaymentAmount,
      paymentMethod: this.newPaymentMethod,
      transactionReference: this.newPaymentReference.trim()
    };

    this.bookingService.addPaymentToBooking(request).subscribe({
      next: () => {
        alert('Seña registrada exitosamente.');
        this.loadBookingPayments(this.selectedBookingForPayment!.id);
        this.newPaymentAmount = null;
        this.newPaymentReference = '';
      },
      error: (err) => {
        alert('Error al registrar la seña.');
        console.error(err);
      }
    });
  }
}