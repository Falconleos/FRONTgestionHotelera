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
        this.username = payload.sub || payload.username || 'Usuario';
        this.userId = payload.id || payload.userId || null;

        // Extraer roles y formatear a una sola palabra limpia
        const roles = payload.roles || payload.authorities || [];
        let rawRole = '';
        if (Array.isArray(roles) && roles.length > 0) {
          rawRole = typeof roles[0] === 'string' ? roles[0] : (roles[0].authority || roles[0].name || '');
        } else if (typeof roles === 'string') {
          rawRole = roles.split(',')[0].trim();
        }

        // Limpiar prefijo ROLE_ y espacios, quedándose solo con la primera palabra
        this.userRole = rawRole.replace(/^ROLE_/i, '').trim().split(' ')[0];

        // Si tenemos ID, cargamos su foto de perfil
        if (this.userId) {
          this.loadProfilePicture(this.userId);
        }
      } catch (e) {
        console.error('Error al decodificar el token:', e);
      }
    }
  }

  loadProfilePicture(id: number): void {
    this.userService.getProfilePicture(id).subscribe({
      next: (blob) => {
        this.avatarUrl = URL.createObjectURL(blob);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('No se pudo cargar la foto de perfil del usuario logueado', err);
        this.avatarUrl = null;
        this.cdr.markForCheck();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        this.router.navigate(['/']);
      },
      error: () => {
        localStorage.removeItem('authToken');
        this.router.navigate(['/']);
      }
    });
  }
}