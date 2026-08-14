// src/app/components/employee-form-component/employee-form-component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { EmployeeService } from '../../services/employee-service';
import { RoleType, UserDtoRequestCreation } from '../../models/user-creation.model';
import { ShiftType, EmployeeDtoRequest } from '../../models/employee-request.model';

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
    gender: '',
    email: '',
    phoneNumber: '',
    address: '',
    birthDay: '',
    role: 'RECEPCIONIST' as RoleType,
    // Campos específicos de empleado
    shift: 'MORNING' as ShiftType,
    salary: 0,
    employeeNumber: '',
    emergencyPhoneNumber: '',
    hireDate: ''
  };

  // Roles permitidos para empleados (omitiendo GUEST)
  availableRoles: RoleType[] = [
    'ADMIN',
    'RECEPCIONIST',
    'HOUSEKEEPING',
    'MAINTENANCE',
    'RELIEF_STAFF'
  ];

  // Turnos disponibles
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

    // Paso 1: Crear el Usuario base tipado correctamente
    const userRequest: UserDtoRequestCreation = {
      username: this.formData.username,
      password: this.formData.password,
      name: this.formData.name,
      surname: this.formData.surname,
      dni: this.formData.dni,
      gender: this.formData.gender || undefined,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber,
      address: this.formData.address || undefined,
      birthDay: this.formData.birthDay, // Requerido por el modelo actualizado
      role: this.formData.role
    };

    this.userService.createUser(userRequest).subscribe({
      next: (createdUser) => {
        // Paso 2: Crear el perfil de empleado incluyendo 'hireDate' requerido por el DTO
        const employeeRequest: EmployeeDtoRequest = {
          userId: createdUser.id,
          employeeNumber: this.formData.employeeNumber || undefined,
          emergencyPhoneNumber: this.formData.emergencyPhoneNumber || undefined,
          hireDate: this.formData.hireDate,
          shift: this.formData.shift,
          salary: Number(this.formData.salary)
        };

        this.employeeService.createEmployee(employeeRequest).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard/employees']);
          },
          error: (err: any) => {
            this.loading = false;
            this.errorMessage = 'El usuario se creó, pero ocurrió un error al asociar el perfil de empleado.';
            this.cdr.markForCheck();
            console.error(err);
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al crear el usuario. Verifique los datos ingresados (DNI o email duplicados).';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}