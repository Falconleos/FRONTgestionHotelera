import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CheckInService } from '../../services/check-in-service';
import { UserService } from '../../services/user-service';
import { BookingDtoResponse } from '../../models/booking.model';

@Component({
  selector: 'app-check-in-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './check-in-create-component.html',
  styleUrls: ['./check-in-create-component.css']
})
export class CheckInCreateComponent implements OnInit {
  bookingId: number | null = null;
  userId: number | null = null;
  selectedGuestName: string = '';
  
  guests: any[] = [];
  checkInDate: string = '';
  checkOutDate: string = '';
  roomNumber: string | number = '';
  roomTypeName: string = '';
  totalPrice: number | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private checkInService: CheckInService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Iniciando componente CheckInCreateComponent');
    this.loadUsers();

    this.route.queryParams.subscribe(params => {
      console.log('Parámetros de URL recibidos:', params);
      if (params['bookingId']) {
        this.bookingId = +params['bookingId'];
        console.log('BookingID detectado:', this.bookingId);
        this.loadBookingDetails(this.bookingId);
      } else {
        console.warn('No se encontró el parámetro bookingId en la URL');
      }
      if (params['userId']) {
        this.userId = +params['userId'];
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (users: any[]) => {
        console.log('Usuarios crudos recibidos del backend:', users);
        
        this.guests = Array.isArray(users) ? users.filter(user => {
          if (!user.roles || !Array.isArray(user.roles)) return false;
          
          return user.roles.some((role: any) => {
            if (typeof role === 'string') {
              return role.toUpperCase().includes('GUEST');
            }
            return (
              (role.name && role.name.toUpperCase().includes('GUEST')) ||
              (role.authority && role.authority.toUpperCase().includes('GUEST')) ||
              (role.roleName && role.roleName.toUpperCase().includes('GUEST'))
            );
          });
        }) : [];

        console.log('Usuarios filtrados (huéspedes):', this.guests);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error al cargar la lista de usuarios', err);
        this.errorMessage = 'No se pudo cargar la lista de usuarios desde el servidor.';
        this.cdr.markForCheck();
      }
    });
  }

  loadBookingDetails(id: number): void {
    console.log('Ejecutando peticion GET para la reserva ID:', id);
    this.checkInService.getBookingById(id).subscribe({
      next: (booking: any) => {
        console.log('Respuesta cruda del backend para la reserva:', booking);
        if (booking) {
          this.checkInDate = booking.checkIn || '';
          this.checkOutDate = booking.checkOut || '';
          this.totalPrice = booking.totalPrice ?? null;

          if (booking.room) {
            this.roomNumber = booking.room.number || '';
            this.roomTypeName = booking.room.roomTypeName || '';
          }
          
          if (booking.guestFirstName || booking.guestLastName) {
            this.selectedGuestName = `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim();
          }

          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        console.error('Error detallado en la petición HTTP:', err);
        this.errorMessage = 'Error al obtener los datos de la reserva.';
        this.cdr.markForCheck();
      }
    });
  }

  selectGuest(guest: any): void {
    this.userId = guest.id;
    this.selectedGuestName = `${guest.name || ''} ${guest.surname || ''}`;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (!this.bookingId || !this.userId) {
      this.errorMessage = 'Debe seleccionar un huésped de la lista y tener una reserva válida.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request = {
      bookingId: this.bookingId,
      userId: this.userId
    };

    this.checkInService.createCheckIn(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '¡Check-In registrado con éxito!';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/dashboard/check-ins']);
        }, 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = 'Error al registrar el Check-In en el servidor.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}