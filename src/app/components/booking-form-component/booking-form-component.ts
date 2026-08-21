import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { BookingStateService } from '../../services/booking-state-service';
import { UserDtoResponse } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';


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
  usersList: UserDtoResponse[] = [];
  
  isRegisteredUser: boolean = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private bookingStateService: BookingStateService,
    private http: HttpClient,
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
    this.loadUsers();
  }

  // Carga la lista de usuarios para la opción de usuario registrado
  loadUsers(): void {
    this.http.get<UserDtoResponse[]>('http://localhost:8080/private/user', { withCredentials: true }).subscribe({
      next: (users: UserDtoResponse[]) => {
        this.usersList = Array.isArray(users) ? users : [];
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar la lista de usuarios', err);
      }
    });
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      isRegisteredUser: [false],
      userId: [null],
      guestFirstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      guestLastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      guestPhone: ['', [Validators.required]],
      observation: ['', [Validators.maxLength(250)]]
    });

    // Control dinámico de validaciones según si se selecciona usuario registrado o reserva rápida
    this.bookingForm.get('isRegisteredUser')?.valueChanges.subscribe((isReg: any) => {
      this.isRegisteredUser = isReg;
      const firstNameCtrl = this.bookingForm.get('guestFirstName');
      const lastNameCtrl = this.bookingForm.get('guestLastName');
      const phoneCtrl = this.bookingForm.get('guestPhone');
      const userIdCtrl = this.bookingForm.get('userId');

      if (isReg) {
        firstNameCtrl?.clearValidators();
        lastNameCtrl?.clearValidators();
        phoneCtrl?.clearValidators();
        userIdCtrl?.setValidators([Validators.required]);
      } else {
        firstNameCtrl?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(100)]);
        lastNameCtrl?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(100)]);
        phoneCtrl?.setValidators([Validators.required]);
        userIdCtrl?.clearValidators();
        userIdCtrl?.setValue(null);
      }

      firstNameCtrl?.updateValueAndValidity();
      lastNameCtrl?.updateValueAndValidity();
      phoneCtrl?.updateValueAndValidity();
      userIdCtrl?.updateValueAndValidity();
      this.cdr.markForCheck();
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

    let firstName = formValues.guestFirstName;
    let lastName = formValues.guestLastName;
    let phone = formValues.guestPhone;

    // Si es un usuario registrado, extraemos sus datos de la lista cumpliendo con las validaciones
    if (formValues.isRegisteredUser && formValues.userId) {
      const selectedUser = this.usersList.find(u => u.id === Number(formValues.userId));
      if (selectedUser) {
        firstName = selectedUser.name;
        lastName = selectedUser.surname;
        // Evitamos usar el username como teléfono; si no existe un teléfono en el objeto, usamos uno por defecto
        phone = selectedUser.phoneNumber || 'Sin teléfono';
      }
    }

    // Payload adaptado al BookingDTORequest del backend
    const requestPayload = {
      checkIn: this.bookingData.checkIn,
      checkOut: this.bookingData.checkOut,
      guestCount: this.bookingData.guestCount,
      roomId: this.bookingData.room.id,
      userId: formValues.isRegisteredUser ? Number(formValues.userId) : null,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestPhone: phone || 'Sin teléfono',
      observation: formValues.observation || undefined,
      totalPrice: this.bookingData.totalPrice
    };

    this.bookingService.createBooking(requestPayload).subscribe({
      next: () => {
        this.loading = false;
        alert('¡Reserva creada con éxito!');
        this.bookingStateService.clear();
        this.router.navigate(['/dashboard/bookings']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar la reserva en el sistema. Verifique los datos.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}