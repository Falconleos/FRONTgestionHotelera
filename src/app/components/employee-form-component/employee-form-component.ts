import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { EmployeeService } from '../../services/employee-service';
import { RoleType } from '../../models/user-creation.model';
import { ShiftType } from '../../models/employee-request.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-form-component.html',
  styleUrls: ['./employee-form-component.css']
})
export class EmployeeFormComponent {
  // Objeto unificado para capturar todos los datos del formulario
  formData = {
    username: '',
    password: '',
    name: '',
    surname: '',
    dni: '',
    email: '',
    phoneNumber: '',
    birthDay: '',
    role: 'RECEPCIONIST' as RoleType, // Rol por defecto (excluyendo GUEST por lógica de empleado)
    shift: 'MORNING' as ShiftType,
    salary: 0
  };

  // Roles permitidos para empleados (según tu enum de Java, omitiendo GUEST)
  availableRoles: RoleType[] = [
    'ADMIN',
    'RECEPCIONIST',
    'HOUSEKEEPING',
    'MAINTENANCE',
    'RELIEF_STAFF'
  ];

  // Turnos disponibles (según tu enum Shift de Java)
  availableShifts: ShiftType[] = [
    'MORNING',
    'AFTERNOON',
    'NIGHT'
  ];

  loading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private employeeService: EmployeeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    // Paso 1: Crear el Usuario base
    const userRequest = {
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

    this.userService.createUser(userRequest).subscribe({
      next: (createdUser) => {
        // Paso 2: Con el ID del usuario creado, creamos el perfil de empleado
        const employeeRequest = {
          userId: createdUser.id,
          shift: this.formData.shift,
          salary: Number(this.formData.salary)
        };

        this.employeeService.createEmployee(employeeRequest).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard/employees']);
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = 'El usuario se creó, pero ocurrió un error al asociar el perfil de empleado.';
            this.cdr.markForCheck();
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al crear el usuario. Verifique los datos ingresados (DNI o email duplicados).';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}