import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css']
})
export class DashboardComponent implements OnInit {
  username: string = 'Usuario';
  userRole: string = '';
  userId: number | null = null;
  avatarUrl: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.sub || localStorage.getItem('username') || 'Usuario';
        
        // 1. Intentar leer el ID del token
        this.userId = payload.id || payload.userId || payload.uid || null;

        // Extraer roles
        const roles = payload.role || payload.roles || payload.authorities || [];
        let rawRole = '';
        if (Array.isArray(roles) && roles.length > 0) {
          rawRole = typeof roles[0] === 'string' ? roles[0] : (roles[0].authority || roles[0].name || '');
        } else if (typeof roles === 'string') {
          rawRole = roles.split(',')[0].trim();
        }
        this.userRole = rawRole.replace(/^ROLE_/i, '').trim().split(' ')[0];

        // 2. Si no está en el token, buscar en localStorage
        if (!this.userId) {
          const storedId = localStorage.getItem('userId');
          if (storedId) {
            this.userId = Number(storedId);
          }
        }

        // 3. Si tenemos ID numérico, cargamos la foto directo
        if (this.userId) {
          this.loadProfilePictureById(this.userId);
        } else if (this.username && this.username !== 'Usuario') {
          // 4. Si no hay ID, buscamos en la lista general de usuarios por username
          this.userService.getAll().subscribe({
            next: (users) => {
              const currentUser = users.find((u: any) => 
                u.username === this.username || u.email === this.username
              );

              // Corregido: Usamos exclusivamente u.id según UserDtoResponse
              if (currentUser && currentUser.id) {
                this.userId = currentUser.id;
                localStorage.setItem('userId', this.userId!.toString());
                this.loadProfilePictureById(this.userId!);
              } else {
                console.warn('No se encontró un usuario coincidente en la lista para:', this.username);
              }
            },
            error: (err) => {
              console.error('No se pudo obtener la lista de usuarios', err);
            }
          });
        }

      } catch (e) {
        console.error('Error al decodificar el token:', e);
      }
    }
  }

  loadProfilePictureById(id: number): void {
    this.userService.getProfilePicture(id).subscribe({
      next: (blob) => {
        this.avatarUrl = URL.createObjectURL(blob);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('No se pudo cargar la foto de perfil', err);
        this.avatarUrl = null;
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}