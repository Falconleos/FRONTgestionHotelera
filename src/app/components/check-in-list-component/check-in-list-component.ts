import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CheckInService } from '../../services/check-in-service';
import { CheckInDtoResponse } from '../../models/check-in.model';
import { BookingDtoResponse } from '../../models/booking.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-check-in-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './check-in-list-component.html',
  styleUrls: ['./check-in-list-component.css']
})
export class CheckInListComponent implements OnInit {
  checkIns: CheckInDtoResponse[] = [];
  pendingBookingsToday: BookingDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  canModify = false;

  constructor(
    private checkInService: CheckInService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadData();
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

    // Cargamos los check-ins históricos de forma independiente
    this.checkInService.getAll().subscribe({
      next: (checkInsData) => {
        this.checkIns = Array.isArray(checkInsData) ? [...checkInsData] : [];
        this.processPendingBookings();
      },
      error: (err) => {
        console.error('Error cargando check-ins:', err);
        this.checkIns = [];
        this.processPendingBookings(); // Intentamos cargar las de hoy aunque el histórico falle
      }
    });
  }

  processPendingBookings(): void {
    this.checkInService.getTodayCheckIns().subscribe({
      next: (todayBookings) => {
        const activeBookingIdsWithCheckIn = new Set(
          this.checkIns.map(c => c.booking?.id).filter(id => id != null)
        );

        this.pendingBookingsToday = (Array.isArray(todayBookings) ? todayBookings : []).filter(
          b => !activeBookingIdsWithCheckIn.has(b.id)
        );

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando reservas de hoy:', err);
        this.errorMessage = 'No se pudieron cargar las reservas programadas para hoy.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }


  goToCreateCheckIn(booking: any): void {
    const userId = booking.user?.id || booking.userId || booking.guest?.id;

    this.router.navigate(['/dashboard/check-ins/nuevo'], { 
      queryParams: { 
        bookingId: booking.id, 
        userId: userId 
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
        // Extraemos el mensaje específico que viene del backend (mensaje o message)
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