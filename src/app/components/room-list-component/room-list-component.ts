import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../services/room-service';
import { RoomTypeService } from '../../services/room-type-service'; // Asegúrate de tener este servicio creado
import { RoomDtoResponse } from '../../models/room.model';
import { RoomTypeDTOResponse } from '../../models/room-type.model'; // Asegúrate de tener este modelo creado
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-list-component.html',
  styleUrls: ['./room-list-component.css']
})
export class RoomListComponent implements OnInit {
  rooms: RoomDtoResponse[] = [];
  roomTypes: RoomTypeDTOResponse[] = [];
  loading = true;
  loadingTypes = true;
  errorMessage = '';
  errorTypesMessage = '';
  isAdmin = false;

  constructor(
    private roomService: RoomService,
    private roomTypeService: RoomTypeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadRooms();
    this.loadRoomTypes();
  }

  checkUserRole(): void {
    const storedRoles = localStorage.getItem('role');
    if (storedRoles) {
      try {
        const roles = JSON.parse(storedRoles);
        if (Array.isArray(roles)) {
          this.isAdmin = roles.some((r: any) => {
            const val = typeof r === 'string' ? r : (r.authority || '');
            return val === 'ADMIN' || val === 'ROLE_ADMIN';
          });
        } else {
          const val = typeof roles === 'string' ? roles : '';
          this.isAdmin = val === 'ADMIN' || val === 'ROLE_ADMIN';
        }
      } catch (e) {
        this.isAdmin = storedRoles.includes('ADMIN') && !storedRoles.includes('RECEPCIONIST');
      }
    } else {
      this.isAdmin = false;
    }
  }

  loadRooms(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.rooms = Array.isArray(data) ? [...data] : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar las habitaciones o no cuentas con los permisos necesarios.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  loadRoomTypes(): void {
    this.loadingTypes = true;
    this.errorTypesMessage = '';

    this.roomTypeService.getAll().subscribe({
      next: (data) => {
        this.roomTypes = Array.isArray(data) ? [...data] : [];
        this.loadingTypes = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorTypesMessage = 'No se pudieron cargar los tipos de habitación.';
        this.loadingTypes = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  deleteRoom(id: number): void {
    if (!this.isAdmin) {
      alert('No tienes permisos de Administrador para realizar esta acción.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.rooms = this.rooms.filter(room => room.id !== id);
          this.cdr.markForCheck();
        },
        error: (err) => {
          alert('Error al eliminar la habitación. Recuerda que no se puede eliminar si su estado es OCCUPIED o requiere rol ADMIN.');
          console.error(err);
        }
      });
    }
  }

  deleteRoomType(id: number): void {
    if (!this.isAdmin) {
      alert('No tienes permisos de Administrador para realizar esta acción.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este tipo de habitación?')) {
      this.roomTypeService.deleteRoomType(id).subscribe({
        next: () => {
          this.roomTypes = this.roomTypes.filter(type => type.id !== id);
          this.cdr.markForCheck();
        },
        error: (err) => {
          alert('Error al eliminar el tipo de habitación. Asegúrate de que no tenga habitaciones activas asociadas.');
          console.error(err);
        }
      });
    }
  }
}