import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { ItemDtoRequest } from '../../models/item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './item-form-component.html',
  styleUrls: ['./item-form-component.css']
})
export class ItemFormComponent implements OnInit {
  item: ItemDtoRequest = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    isService: false
  };

  isEditMode = false;
  itemId: number | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.itemId = +idParam;
      this.loadItemData(this.itemId);
    }
  }

  onServiceChange(): void {
    if (this.item.isService) {
      this.item.quantity = 1;
    }
  }

  loadItemData(id: number): void {
    this.loading = true;
    this.itemService.getById(id).subscribe({
      next: (data) => {
        this.item = {
          description: data.description,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          isService: data.isService || false
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los datos del ítem.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (!this.item.description || this.item.quantity <= 0 || this.item.unitPrice <= 0) {
      this.errorMessage = 'Por favor complete todos los campos correctamente. La cantidad y el precio deben ser mayores a 0.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const requestObservable = this.isEditMode && this.itemId !== null
      ? this.itemService.updateItem(this.itemId, this.item)
      : this.itemService.createItem(this.item);

    requestObservable.subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.isEditMode ? '¡Ítem actualizado con éxito!' : '¡Ítem creado con éxito!';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/dashboard/items']);
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Ocurrió un error al guardar el ítem.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}