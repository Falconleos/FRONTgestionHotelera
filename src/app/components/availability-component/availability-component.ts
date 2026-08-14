import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { BookingStateService } from '../../services/booking-state-service';
import { RoomDtoResponse } from '../../models/room.model';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './availability-component.html',
  styleUrls: ['./availability-component.css']
})
export class AvailabilityComponent implements OnInit {
  availabilityForm!: FormGroup;
  availableRooms: RoomDtoResponse[] = [];
  loading = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private bookingStateService: BookingStateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.availabilityForm = this.fb.group({
      checkIn: [today, [Validators.required]],
      checkOut: ['', [Validators.required]],
      guestCount: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onSearch(): void {
    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();
      return;
    }

    const { checkIn, checkOut, guestCount } = this.availabilityForm.value;

    if (checkOut <= checkIn) {
      this.errorMessage = 'La fecha de check-out debe ser posterior al check-in.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    this.bookingService.getAvailableRooms(checkIn, checkOut, guestCount).subscribe({
      next: (rooms) => {
        this.availableRooms = Array.isArray(rooms) ? [...rooms] : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Error al consultar la disponibilidad en el sistema.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  // <--- Calcula la cantidad de días entre checkIn y checkOut
  calculateDays(): number {
    const { checkIn, checkOut } = this.availabilityForm.value;
    if (!checkIn || !checkOut) return 1;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 1;
  }

  // <--- Calcula el costo total para una habitación específica
  calculateTotalPrice(pricePerNight: number): number {
    return pricePerNight * this.calculateDays();
  }

  // <--- Pregunta antes de confirmar o cancelar
  selectRoomAndRedirect(room: RoomDtoResponse): void {
    const { checkIn, checkOut } = this.availabilityForm.value;
    const total = this.calculateTotalPrice(room.pricePerNight);
    const days = this.calculateDays();

    const confirmationMessage = 
      `¿Desea confirmar la reserva de la Habitación #${room.number}?\n\n` +
      `Estadía: ${days} día(s) (Del ${checkIn} al ${checkOut})\n` +
      `Total estimado: $${total.toFixed(2)}`;

    const confirmed = window.confirm(confirmationMessage);

    if (confirmed) {
      const { guestCount } = this.availabilityForm.value;
      this.bookingStateService.setBookingData({ checkIn, checkOut, guestCount, room });
      this.router.navigate(['/dashboard/bookings/nuevo']);
    } else {
      // Si cancela, se mantiene en la misma pantalla para volver a consultar u operar
      console.log('Selección de habitación cancelada por el usuario.');
    }
  }
}