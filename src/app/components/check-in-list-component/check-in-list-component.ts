import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckInService } from '../../services/check-in-service';
import { BookingDtoResponse } from '../../models/booking.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-check-in-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in-list-component.html',
  styleUrls: ['./check-in-list-component.css']
})
export class CheckInListComponent implements OnInit {
  pendingBookingsToday: BookingDtoResponse[] = [];
  checkedInBookings: BookingDtoResponse[] = [];

  loading = true;
  errorMessage = '';
  canModify = false;

  selectedBookingForCheckIn: BookingDtoResponse | null = null;
  inputDni = '';
  
  users: any[] = [];
  selectedUserId: number | null = null;
  showUserSelector = false;
  
  showNewUserForm = false;
  newUser = {
    username: '', email: '', password: '', name: '', surname: '', dni: '', phoneNumber: ''
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
        this.canModify = Array.isArray(roles) 
          ? roles.some((r: any) => ['ADMIN', 'ROLE_ADMIN', 'RECEPCIONIST', 'ROLE_RECEPCIONIST'].includes(typeof r === 'string' ? r : r.authority))
          : ['ADMIN', 'ROLE_ADMIN', 'RECEPCIONIST', 'ROLE_RECEPCIONIST'].includes(storedRoles);
      } catch (e) {
        this.canModify = storedRoles.includes('ADMIN') || storedRoles.includes('RECEPCIONIST');
      }
    }
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.checkInService.getTodayCheckIns().subscribe({
      next: (todayBookings) => {
        // FILTRADO ACTUALIZADO: Aceptamos reservas que estén en PENDING o CONFIRMED.
        this.pendingBookingsToday = Array.isArray(todayBookings) 
          ? todayBookings.filter(b => b.state === 'CONFIRMED' || b.state === 'PENDING') 
          : [];
        
        this.loadCheckedInBookings();
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        this.errorMessage = 'No se pudieron cargar las reservas.';
        this.pendingBookingsToday = [];
        this.loadCheckedInBookings();
      }
    });
  }

  loadCheckedInBookings(): void {
    this.checkInService.getBookingsByState('CHECKED_IN').subscribe({
      next: (bookings) => {
        this.checkedInBookings = Array.isArray(bookings) ? bookings : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.checkedInBookings = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadUsers(): void {
    this.checkInService.getAllUsers().subscribe({
      next: (data) => { this.users = Array.isArray(data) ? data : []; },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  goToCreateCheckIn(booking: BookingDtoResponse): void {
    if (!this.canModify) return;

    this.selectedBookingForCheckIn = booking;
    this.inputDni = booking.guestPhone || '';
    this.showUserSelector = false;
    this.showNewUserForm = false;
    this.checkInError = '';
    this.checkInSuccess = '';
    this.selectedUserId = null;

    // Verificamos si tiene un usuario asociado
    const hasUser = (booking as any).userId || (booking as any).userBookingUsername || (booking as any).guestId;

    if (hasUser) {
      this.executeCheckInDirectly(booking.id);
    } else {
      this.showUserSelector = true;
    }
  }

  executeCheckInDirectly(bookingId: number): void {
    this.checkInService.checkInBooking(bookingId).subscribe({
      next: () => {
        this.checkInSuccess = '¡Check-in realizado con éxito!';
        
        // Removemos inmediatamente la card de la lista local para que desaparezca al instante
        this.pendingBookingsToday = this.pendingBookingsToday.filter(b => b.id !== bookingId);

        setTimeout(() => { 
          this.selectedBookingForCheckIn = null; 
          this.loadData(); // Recarga general para actualizar los estados activos
        }, 1200);
      },
      error: (err) => { 
        this.checkInError = err.error?.message || 'Error en el proceso de check-in.'; 
        this.cdr.markForCheck();
      }
    });
  }

  assignAndCheckIn(): void {
    if (!this.selectedBookingForCheckIn || !this.selectedUserId) {
      this.checkInError = 'Debe seleccionar un usuario.';
      return;
    }

    const bId = this.selectedBookingForCheckIn.id;
    this.checkInService.assignUserToBooking(bId, this.selectedUserId).subscribe({
      next: () => {
        this.checkInService.checkInBooking(bId).subscribe({
          next: () => {
            this.checkInSuccess = '¡Check-in y asociación realizados con éxito!';
            this.pendingBookingsToday = this.pendingBookingsToday.filter(b => b.id !== bId);
            setTimeout(() => { 
              this.selectedBookingForCheckIn = null; 
              this.showUserSelector = false; 
              this.loadData(); 
            }, 1500);
          },
          error: (err) => {
            this.checkInError = err.error?.message || 'Error al hacer check-in tras asociar usuario.';
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => { 
        this.checkInError = err.error?.message || 'Error al asociar el usuario.'; 
        this.cdr.markForCheck();
      }
    });
  }

  submitCheckInWithDni(): void {
    if (!this.selectedBookingForCheckIn) return;
    const bId = this.selectedBookingForCheckIn.id;

    this.checkInService.checkInBooking(bId, this.inputDni).subscribe({
      next: () => {
        this.checkInSuccess = '¡Check-in realizado con éxito!';
        this.pendingBookingsToday = this.pendingBookingsToday.filter(b => b.id !== bId);
        setTimeout(() => { 
          this.selectedBookingForCheckIn = null; 
          this.loadData(); 
        }, 1200);
      },
      error: (err) => {
        this.checkInError = err.error?.message || 'Error en proceso.';
        if (this.checkInError.includes('no user associated')) {
          this.showUserSelector = false;
          this.showNewUserForm = true;
        }
        this.cdr.markForCheck();
      }
    });
  }

  createNewUserAndProceed(): void {
    if (!this.selectedBookingForCheckIn) return;
    const bId = this.selectedBookingForCheckIn.id;

    this.checkInService.createUser(this.newUser).subscribe({
      next: (createdUser) => {
        this.checkInService.assignUserToBooking(bId, createdUser.id).subscribe({
          next: () => {
            this.checkInService.checkInBooking(bId, createdUser.dni).subscribe({
              next: () => {
                this.checkInSuccess = '¡Check-in exitoso!';
                this.pendingBookingsToday = this.pendingBookingsToday.filter(b => b.id !== bId);
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
        this.checkInError = err.error?.message || 'Error al crear usuario.'; 
        this.cdr.markForCheck();
      }
    });
  }

  interruptStay(id: number): void {
    const reason = prompt('Motivo de interrupción de estadía:');
    if (reason && reason.trim() !== '') {
      this.checkInService.interruptStay(id, reason).subscribe({
        next: () => {
          alert('Estadía interrumpida.');
          this.loadData();
        },
        error: (err) => alert(err.error?.message || 'Error al interrumpir.')
      });
    }
  }

  viewAccountPlaceholder(id: number): void { this.router.navigate([`/dashboard/check-ins/${id}/cuenta`]); }
  servicesPlaceholder(id: number): void { this.router.navigate([`/dashboard/check-ins/${id}/servicios`]); }
}