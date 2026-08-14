import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomAttentionService } from '../../services/room-attention-service';
import { ItemService } from '../../services/item-service'; // Asegúrate de tener este servicio para listar ítems/servicios
import { RoomAttentionDtoRequest } from '../../models/room-attention.model';

@Component({
  selector: 'app-room-attention-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room-attention-form-component.html',
  styleUrls: ['./room-attention-form-component.css']
})
export class RoomAttentionFormComponent implements OnInit {
  checkInId!: number;
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
    const idParam = this.route.snapshot.paramMap.get('checkInId');
    if (idParam) {
      this.checkInId = +idParam;
      this.loadAvailableItems();
    } else {
      this.errorMessage = 'ID de check-in no válido.';
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
    // Si es un servicio (isService === true), por regla general la cantidad es 1 fija o no acumulativa
    if (this.selectedItem && this.selectedItem.isService) {
      this.quantity = 1;
    }
  }

  calculateSubtotal(): number {
    if (!this.selectedItem) return 0;
    const price = this.selectedItem.price || this.selectedItem.unitPrice || 0;
    const qty = this.selectedItem.isService ? 1 : (this.quantity || 1);
    return price * qty;
  }

  onSubmit(): void {
    if (!this.selectedItem) {
      alert('Por favor selecciona un ítem o servicio.');
      return;
    }

    if (!this.selectedItem.isService && (!this.quantity || this.quantity <= 0)) {
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
        checkInId: this.checkInId,
        itemId: this.selectedItem.id,
        quantity: this.selectedItem.isService ? 1 : this.quantity
      };

      this.roomAttentionService.addAttention(request).subscribe({
        next: () => {
          alert('Consumo registrado exitosamente.');
          this.router.navigate([`/dashboard/check-ins/${this.checkInId}/servicios`]);
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