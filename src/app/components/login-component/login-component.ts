import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { finalize } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);

        // Decodificar el JWT para extraer los roles/autoridades
        try {
          const payloadBase64 = response.token.split('.')[1];
          const decodedJson = atob(payloadBase64);
          const decodedToken = JSON.parse(decodedJson);

          // Spring Security suele guardar el rol en "role", "roles", "authorities" o "sub"
          const roles = decodedToken.role || decodedToken.roles || decodedToken.authorities || [];
          localStorage.setItem('role', JSON.stringify(roles));
        } catch (e) {
          console.error('Error al decodificar el token:', e);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.mensaje || 'Usuario o contraseña incorrectos.';
        this.cdr.markForCheck();
        console.error('Error de login:', err);
      }
    });
  }
}