import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { UserDtoRequestCreation, RoleType } from '../../models/user-creation.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-form-component.html',
  styleUrls: ['./user-form-component.css'] // <-- Agrega esta línea (o styleUrl según tu versión de Angular)
})
export class UserFormComponent {
  formData = {
    username: '',
    password: '',
    name: '',
    surname: '',
    dni: '',
    email: '',
    phoneNumber: '',
    birthDay: '',
    role: 'GUEST' as RoleType
  };

  loading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    const payload: UserDtoRequestCreation = {
      username: this.formData.username,
      password: this.formData.password,
      name: this.formData.name,
      surname: this.formData.surname,
      dni: this.formData.dni,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber,
      birthDay: this.formData.birthDay ? this.formData.birthDay : undefined,
      role: this.formData.role
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('¡Usuario creado con éxito!');
        this.router.navigate(['/dashboard/usuarios']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar el usuario en el sistema. Verifique los datos o si el username/email/DNI ya existen.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}