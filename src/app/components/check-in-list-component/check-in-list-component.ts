import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CheckInService } from '../../services/check-in-service';
import { CheckInDtoResponse } from '../../models/check-in.model';
import { BookingDtoResponse } from '../../models/booking.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-check-in-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './check-in-list-component.html',
  styleUrls: ['./check-in-list-component.css']
})
export class CheckInListComponent implements OnInit {
  // Lista superior: Reservas de hoy pendientes o confirmadas
  pendingBookingsToday: BookingDtoResponse[] = [];
  
  // Lista inferior: Reservas que ya tienen estado CHECKED_IN
  checkedInBookings: BookingDtoResponse[] = [];

  loading = true;
  errorMessage = '';
  canModify = false;

  // --- PROPIEDADES PARA EL FLUJO DE CHECK-IN Y ASOCIACIÓN DE USUARIOS ---
  selectedBookingForCheckIn: BookingDtoResponse | null = null;
  inputDni = '';
  
  users: any[] = [];
  showNewUserForm = false;
  newUser = {
    username: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    dni: '',
    phoneNumber: ''
  };
  checkInError = '';
  checkInSuccess = '';

  constructor(
    private checkInService: CheckInService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadData();
    this.loadUsers();
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

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    // 1. Cargamos las reservas de hoy (pendientes/confirmadas para hacerles check-in arriba)
    this.checkInService.getTodayCheckIns().subscribe({
      next: (todayBookings) => {
        this.pendingBookingsToday = Array.isArray(todayBookings) ? todayBookings : [];
        this.loadCheckedInBookings();
      },
      error: (err) => {
        console.error('Error cargando reservas de hoy:', err);
        this.errorMessage = 'No se pudieron cargar las reservas programadas para hoy.';
        this.pendingBookingsToday = [];
        this.loadCheckedInBookings();
      }
    });
  }

  loadCheckedInBookings(): void {
    // 2. Cargamos las reservas que están en estado CHECKED_IN para la tabla inferior
    this.checkInService.getBookingsByState('CHECKED_IN').subscribe({
      next: (bookings) => {
        this.checkedInBookings = Array.isArray(bookings) ? bookings : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando reservas con check-in activo:', err);
        this.checkedInBookings = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadUsers(): void {
    this.checkInService.getAllUsers().subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar la lista de usuarios:', err)
    });
  }

  // --- LÓGICA DE CHECK-IN Y ASOCIACIÓN DE USUARIOS ---

  goToCreateCheckIn(booking: BookingDtoResponse): void {
    if (!this.canModify) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      return;
    }

    this.selectedBookingForCheckIn = booking;
    this.inputDni = booking.guestPhone || ''; 
    this.showNewUserForm = false;
    this.checkInError = '';
    this.checkInSuccess = '';
  }

  submitCheckInWithDni(): void {
    if (!this.selectedBookingForCheckIn) return;

    this.checkInService.checkInBooking(this.selectedBookingForCheckIn.id, this.inputDni).subscribe({
      next: () => {
        this.checkInSuccess = '¡Check-in realizado con éxito!';
        setTimeout(() => {
          this.selectedBookingForCheckIn = null;
          this.loadData();
        }, 1200);
      },
      error: (err) => {
        console.error('Error en check-in:', err);
        const msg = err.error?.message || 'Error al procesar el check-in.';
        this.checkInError = msg;
        if (msg.includes('No user found') || msg.includes('no user associated')) {
          this.showNewUserForm = true; 
        }
        this.cdr.markForCheck();
      }
    });
  }

  createNewUserAndProceed(): void {
    if (!this.selectedBookingForCheckIn) return;

    this.checkInService.createUser(this.newUser).subscribe({
      next: (createdUser) => {
        this.checkInSuccess = 'Usuario creado con éxito. Asociando y realizando check-in...';
        
        this.checkInService.assignUserToBooking(this.selectedBookingForCheckIn!.id, createdUser.id).subscribe({
          next: () => {
            this.checkInService.checkInBooking(this.selectedBookingForCheckIn!.id, createdUser.dni).subscribe({
              next: () => {
                this.checkInSuccess = '¡Check-in y asociación completados con éxito!';
                setTimeout(() => {
                  this.selectedBookingForCheckIn = null;
                  this.showNewUserForm = false;
                  this.loadData();
                }, 1500);
              }
            });
          }
        });
      },
      error: (err) => {
        this.checkInError = err.error?.message || 'Error al crear el nuevo usuario.';
        this.cdr.markForCheck();
      }
    });
  }

  interruptStay(id: number): void {
    if (!this.canModify) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      return;
    }

    const reason = prompt('Ingrese el motivo de la interrupción de la estadía:');
    if (!reason || reason.trim() === '') {
      alert('Debe ingresar un motivo válido para interrumpir la estadía.');
      return;
    }

    this.checkInService.interruptStay(id, reason).subscribe({
      next: () => {
        alert('Estadía interrumpida exitosamente.');
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        const backendMessage = err.error?.mensaje || err.error?.message;
        alert(backendMessage || 'Error al intentar interrumpir la estadía.');
      }
    });
  }

  viewAccountPlaceholder(id: number): void {
    this.router.navigate([`/dashboard/check-ins/${id}/cuenta`]);
  }

  servicesPlaceholder(id: number): void {
    this.router.navigate([`/dashboard/check-ins/${id}/servicios`]);
  }
}