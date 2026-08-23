import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.sub || localStorage.getItem('username') || 'Usuario';
        
        // Extraer roles del token
        const roles = payload.role || payload.roles || payload.authorities || payload.roles || [];
        let rawRole = '';
        if (Array.isArray(roles) && roles.length > 0) {
          rawRole = typeof roles[0] === 'string' ? roles[0] : (roles[0].authority || roles[0].name || '');
        } else if (typeof roles === 'string') {
          rawRole = roles.split(',')[0].trim();
        }
        this.userRole = rawRole.replace(/^ROLE_/i, '').trim().split(' ')[0];

        // 1. Revisar si ya tenemos el ID en localStorage
        const storedId = localStorage.getItem('userId');
        if (storedId) {
          this.userId = Number(storedId);
          this.loadProfilePictureById(this.userId);
        } else if (this.username && this.username !== 'Usuario') {
          // 2. Si no está en localStorage, lo consultamos con el nuevo endpoint público por username
          this.authService.getUserIdByUsername(this.username).subscribe({
            next: (id) => {
              if (id) {
                this.userId = id;
                localStorage.setItem('userId', id.toString());
                this.loadProfilePictureById(id);
              }
            },
            error: (err) => {
              console.warn('No se pudo obtener el ID del usuario por username:', err);
            }
          });
        }

      } catch (e) {
        console.error('Error al decodificar el token:', e);
      }
    }
  }

  loadProfilePictureById(id: number): void {
    this.avatarUrl = `http://localhost:8080/public/auth/${id}/profile-picture`;
    this.cdr.markForCheck();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}