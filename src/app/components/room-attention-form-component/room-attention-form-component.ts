import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomAttentionService } from '../../services/room-attention-service';
import { ItemService } from '../../services/item-service';
import { RoomAttentionDtoRequest } from '../../models/room-attention.model';

@Component({
  selector: 'app-room-attention-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room-attention-form-component.html',
  styleUrls: ['./room-attention-form-component.css']
})
export class RoomAttentionFormComponent implements OnInit {
  bookingId!: number;
  availableItems: any[] = [];
  selectedItem: any = null;
  quantity: number = 1;
  loadingItems = true;
  submitting = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomAttentionService: RoomAttentionService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('bookingId');
    if (idParam) {
      this.bookingId = +idParam;
      this.loadAvailableItems();
    } else {
      this.errorMessage = 'ID de reserva no válido.';
      this.loadingItems = false;
    }
  }

  loadAvailableItems(): void {
    this.loadingItems = true;
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.availableItems = Array.isArray(items) ? items : [];
        this.loadingItems = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el catálogo de ítems y servicios.';
        this.loadingItems = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  onItemChange(): void {
    // Ya no reseteamos la cantidad a 1 de forma forzosa al cambiar de ítem/servicio,
    // permitiendo que el usuario pueda escribir la cantidad que necesite.
  }

  calculateSubtotal(): number {
    if (!this.selectedItem) return 0;
    const price = this.selectedItem.price || this.selectedItem.unitPrice || 0;
    const qty = this.quantity || 1; // Usamos siempre la cantidad ingresada
    return price * qty;
  }

  onSubmit(): void {
    if (!this.selectedItem) {
      alert('Por favor selecciona un ítem o servicio.');
      return;
    }

    if (!this.quantity || this.quantity <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }

    const itemDesc = this.selectedItem.description || this.selectedItem.name || 'este elemento';
    const subtotalVal = this.calculateSubtotal();
    const typeLabel = this.selectedItem.isService ? 'servicio' : 'ítem';

    const confirmMsg = `¿Estás seguro de registrar el ${typeLabel} "${itemDesc}" con un subtotal de $${subtotalVal.toFixed(2)}?`;

    if (confirm(confirmMsg)) {
      this.submitting = true;
      const request: RoomAttentionDtoRequest = {
        bookingId: this.bookingId,
        itemId: this.selectedItem.id,
        quantity: this.quantity // Enviamos la cantidad que el usuario colocó
      };

      this.roomAttentionService.addAttention(request).subscribe({
        next: () => {
          alert('Consumo registrado exitosamente.');
          this.router.navigate([`/dashboard/bookings/${this.bookingId}/servicios`]);
        },
        error: (err) => {
          this.submitting = false;
          alert('Error al registrar el consumo.');
          console.error(err);
          this.cdr.markForCheck();
        }
      });
    }
  }
}