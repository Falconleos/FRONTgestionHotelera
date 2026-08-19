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
  styleUrls: ['./user-form-component.css']
})
export class UserFormComponent {
  formData = {
    username: '',
    password: '',
    name: '',
    surname: '',
    dni: '',
    gender: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthDay: '',
    role: 'GUEST' as RoleType,
    profilePictureFile: undefined as File | undefined,
    enabled: true // <-- Añadido para que nazca activo por defecto
  };

  loading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.formData.profilePictureFile = file;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    const payload: UserDtoRequestCreation = {
      username: this.formData.username,
      password: this.formData.password,
      name: this.formData.name,
      surname: this.formData.surname,
      dni: this.formData.dni,
      gender: this.formData.gender,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber,
      address: this.formData.address || undefined,
      birthDay: this.formData.birthDay ? this.formData.birthDay : undefined,
      role: this.formData.role,
      profilePictureFile: this.formData.profilePictureFile,
      enabled: this.formData.enabled // <-- Incluido en el payload que se envía al servicio
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('¡Usuario creado con éxito!');
        this.router.navigate(['/dashboard/usuarios']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.mensaje || err.error?.message || 'Error al registrar el usuario en el sistema. Verifique los datos o si el username/email/DNI ya existen.';
        this.cdr.markForCheck();
        alert(this.errorMessage);
        console.error(err);
      }
    });
  }
}
