import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { ItemDtoResponse } from '../../models/item.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list-component.html',
  styleUrls: ['./item-list-component.css']
})
export class ItemListComponent implements OnInit, OnDestroy {
  items: (ItemDtoResponse & { imageUrl?: string })[] = [];
  loading = true;
  errorMessage = '';
  isAdmin = false;

  constructor(
    private itemService: ItemService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadItems();
  }

  ngOnDestroy(): void {
    // Limpiamos las URLs creadas en memoria para evitar fugas de memoria
    this.items.forEach(item => {
      if (item.imageUrl) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });
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

  loadItems(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.itemService.getAll().subscribe({
      next: (data) => {
        this.items = Array.isArray(data) ? data.map(item => ({ ...item })) : [];
        this.loading = false;
        this.cdr.markForCheck();

        // Cargamos la imagen individual de cada ítem de forma asíncrona
        this.items.forEach(item => {
          if (item.id) {
            this.itemService.getItemImage(item.id).subscribe({
              next: (blob) => {
                if (blob && blob.size > 0) {
                  item.imageUrl = URL.createObjectURL(blob);
                  this.cdr.markForCheck();
                }
              },
              error: () => {
                // Si el ítem no tiene imagen, el backend devolverá 404 u otro error que simplemente ignoramos
              }
            });
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los ítems o no cuentas con los permisos necesarios.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  deleteItem(id: number): void {
    if (!this.isAdmin) {
      alert('No tienes permisos de Administrador para realizar esta acción.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este ítem?')) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id !== id);
          this.cdr.markForCheck();
        },
        error: (err) => {
          alert('Error al eliminar el ítem.');
          console.error(err);
        }
      });
    }
  }
}