import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { BookingStateService } from '../../services/booking-state-service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './booking-form-component.html',
  styleUrls: ['./booking-form-component.css']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingData: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private bookingStateService: BookingStateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bookingData = this.bookingStateService.getBookingData();

    if (!this.bookingData) {
      alert('No se ha seleccionado ninguna habitación previa.');
      this.router.navigate(['/dashboard/bookings/disponibilidad']);
      return;
    }

    this.initForm();
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      guestFirstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      guestLastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      guestPhone: ['', [Validators.required]],
      observation: ['', [Validators.maxLength(250)]]
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValues = this.bookingForm.value;

    const requestPayload = {
      checkIn: this.bookingData.checkIn,
      checkOut: this.bookingData.checkOut,
      guestCount: this.bookingData.guestCount,
      guestFirstName: formValues.guestFirstName,
      guestLastName: formValues.guestLastName,
      guestPhone: formValues.guestPhone,
      observation: formValues.observation,
      roomId: this.bookingData.room.id
    };

    this.bookingService.createBooking(requestPayload).subscribe({
      next: () => {
        this.loading = false;
        alert('¡Reserva creada con éxito!');
        this.bookingStateService.clear();
        this.router.navigate(['/dashboard/bookings']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al registrar la reserva en el sistema. Verifique los datos.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}