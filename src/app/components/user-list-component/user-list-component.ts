import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // <--- 1. Importar Router aquí
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
    private router: Router, // <--- 2. Inyectar Router aquí
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

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.userService.getAll().subscribe({
      next: (data) => {
        const allUsers = Array.isArray(data) ? [...data] : [];
        
        // Filtramos para mantener únicamente a los usuarios que tengan el rol GUEST
        this.users = allUsers.filter(user => 
          user.roles && user.roles.some(role => role.name === 'GUEST')
        );

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'No se pudieron cargar los usuarios o no cuentas con los permisos necesarios.';
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