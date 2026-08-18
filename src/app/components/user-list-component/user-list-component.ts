// src/app/components/user-list/user-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { UserDtoResponse } from '../../models/user.model';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list-component.html',
  styleUrls: ['./user-list-component.css']
})
export class UserListComponent implements OnInit {
  users: UserDtoResponse[] = [];
  loading = true;
  errorMessage = '';
  canModify = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadUsers();
  }

  checkUserRole(): void {
    const storedRoles = localStorage.getItem('role');
    if (storedRoles) {
      try {
        const roles = JSON.parse(storedRoles);
        if (Array.isArray(roles)) {
          this.canModify = roles.some((r: any) => {
            const val = typeof r === 'string' ? r : (r.authority || r.role || r.name || '');
            const upperVal = val.toUpperCase();
            return upperVal === 'ADMIN' || upperVal === 'ROLE_ADMIN' || upperVal === 'RECEPCIONIST' || upperVal === 'ROLE_RECEPCIONIST';
          });
        } else {
          const val = typeof roles === 'string' ? roles : '';
          const upperVal = val.toUpperCase();
          this.canModify = upperVal === 'ADMIN' || upperVal === 'ROLE_ADMIN' || upperVal === 'RECEPCIONIST' || upperVal === 'ROLE_RECEPCIONIST';
        }
      } catch (e) {
        this.canModify = storedRoles.includes('ADMIN') || storedRoles.includes('RECEPCIONIST');
      }
    } else {
      this.canModify = false;
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Llamamos al nuevo endpoint filtrado por el backend
    this.userService.getByRole('GUEST').subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los huéspedes.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }

  deleteUser(id: number): void {
    if (!this.canModify) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
          this.cdr.markForCheck();
        },
        error: (err) => {
          alert('Error al eliminar el usuario.');
          console.error(err);
        }
      });
    }
  }

  goToNewUser(): void {
    if (this.canModify) {
      this.router.navigate(['/dashboard/usuarios/nuevo']);
    } else {
      alert('No tienes los permisos necesarios.');
    }
  }
}