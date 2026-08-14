import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class ItemListComponent implements OnInit {
  items: ItemDtoResponse[] = [];
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
        this.items = Array.isArray(data) ? [...data] : [];
        this.loading = false;
        this.cdr.markForCheck();
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