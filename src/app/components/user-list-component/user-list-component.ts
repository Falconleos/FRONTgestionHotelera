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

  // Almacena las URLs seguras creadas con blobs para cada ID de usuario
  userAvatars: { [key: number]: string } = {};

  selectedUser: UserDtoResponse | null = null;

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
    
    this.userService.getByRole('GUEST').subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [];
        this.loading = false;
        
        // Precargamos los avatares para cada usuario de la lista
        this.users.forEach(user => {
          this.loadUserAvatar(user);
        });

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
          delete this.userAvatars[id]; // Limpiamos la caché de la foto si se elimina
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

  // Métodos para controlar el modal:
  openUserDetail(user: UserDtoResponse): void {
    this.selectedUser = user;
    this.loadUserAvatar(user);
  }

  closeUserDetail(): void {
    this.selectedUser = null;
  }

  deleteUserModal(id: number): void {
    this.closeUserDetail();
    this.deleteUser(id);
  }

  // Carga la imagen mediante el servicio asegurando el envío del Token JWT
  loadUserAvatar(user: UserDtoResponse): void {
    if (!user || !user.id) return;

    // Si ya fue cargada anteriormente o está cargando, evitamos solicitudes repetidas
    if (this.userAvatars[user.id]) return;

    this.userService.getProfilePicture(user.id).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.userAvatars[user.id] = objectURL;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar la foto de perfil', err);
        this.userAvatars[user.id] = 'assets/default-avatar.png';
        this.cdr.markForCheck();
      }
    });
  }

  // Retorna la URL de objeto segura o la imagen por defecto
  getUserAvatarUrl(user: UserDtoResponse | null): string {
    if (!user || !user.id) {
      return 'assets/default-avatar.png';
    }
    return this.userAvatars[user.id] || 'assets/default-avatar.png';
  }
}