import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomAttentionService } from '../../services/room-attention-service';
import { RoomAttentionDtoResponse } from '../../models/room-attention.model';

@Component({
  selector: 'app-room-attention-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-attention-list-component.html',
  styleUrls: ['./room-attention-list-component.css']
})
export class RoomAttentionListComponent implements OnInit {
  bookingId!: number; // <--- Declarada correctamente aquí
  attentions: RoomAttentionDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  canModify = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomAttentionService: RoomAttentionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    const idParam = this.route.snapshot.paramMap.get('bookingId');
    if (idParam) {
      this.bookingId = +idParam;
      this.loadAttentions();
    } else {
      this.errorMessage = 'ID de reserva no válido.';
      this.loading = false;
    }
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
    }
  }

  loadAttentions(): void {
    this.loading = true;
    this.roomAttentionService.getByBooking(this.bookingId).subscribe({
      next: (data) => {
        this.attentions = Array.isArray(data) ? [...data] : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los servicios de la reserva.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  calculateTotal(): number {
    return this.attentions.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
  }

  deleteAttention(id: number): void {
    if (!this.canModify) {
      alert('No tienes permisos para realizar esta acción.');
      return;
    }

    if (confirm('¿Estás seguro de quitar este consumo de la cuenta?')) {
      this.roomAttentionService.deleteAttention(id).subscribe({
        next: () => {
          this.attentions = this.attentions.filter(att => att.id !== id);
          this.cdr.markForCheck();
        },
        error: (err) => {
          alert('Error al eliminar el consumo.');
          console.error(err);
        }
      });
    }
  }

  openAddModalPlaceholder(): void {
    this.router.navigate([`/dashboard/bookings/${this.bookingId}/servicios/nuevo`]);
  }
}