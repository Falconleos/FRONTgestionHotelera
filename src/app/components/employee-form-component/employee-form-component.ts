// src/app/components/employee-form-component/employee-form-component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee-service';
import { EmployeeCreateUnifiedDTO, RoleType, ShiftType } from '../../models/employee-create-unified.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-form-component.html',
  styleUrls: ['./employee-form-component.css']
})
export class EmployeeFormComponent {

  // Método auxiliar para obtener la fecha de hoy en formato 'YYYY-MM-DD'
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  // Objeto unificado para capturar todos los datos del formulario de una vez
  formData = {
    username: '',
    password: '',
    name: '',
    surname: '',
    dni: '',
    gender: 'MASCULINO', // Valor por defecto opcional
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
    hireDate: this.getTodayDate(), // <-- Por defecto el día actual
    profilePictureFile: null as File | null // <-- Campo para la foto
  };

  // Roles permitidos para empleados
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

  // Opciones de género
  availableGenders: string[] = [
    'MASCULINO',
    'FEMENINO',
    'OTRO',
    'PREFIERO NO DECIR'
  ];

  loading = false;
  errorMessage = '';
  fileError = ''; // <-- Para mostrar error si la foto supera los 2 MB

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Método para capturar y validar la foto de perfil (Máximo 2 MB)
 // Método para capturar y validar la foto de perfil (Máximo estricto de 2 MB)
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.fileError = '';

    if (file) {
      const maxSizeInBytes = 2 * 1024 * 1024; // Exactamente 2 MB en bytes
      
      if (file.size > maxSizeInBytes) {
        // Redondeamos a 1 decimal para mostrar un mensaje claro
        const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
        this.fileError = `La imagen pesa ${fileSizeMb} MB. El tamaño máximo permitido es de 2 MB.`;
        this.formData.profilePictureFile = null;
        event.target.value = ''; // Limpia el input del archivo en el HTML
        this.cdr.markForCheck();
        return;
      }
      
      this.formData.profilePictureFile = file;
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.fileError) return;

    this.loading = true;
    this.errorMessage = '';

    const requestData: EmployeeCreateUnifiedDTO = {
      username: this.formData.username,
      password: this.formData.password,
      name: this.formData.name,
      surname: this.formData.surname,
      dni: this.formData.dni,
      gender: this.formData.gender || undefined,
      email: this.formData.email,
      phoneNumber: this.formData.phoneNumber || undefined,
      address: this.formData.address || undefined,
      birthDay: this.formData.birthDay || undefined,
      role: this.formData.role,
      profilePictureFile: this.formData.profilePictureFile || undefined, // <-- Añadido
      employeeNumber: this.formData.employeeNumber || undefined,
      emergencyPhoneNumber: this.formData.emergencyPhoneNumber || undefined,
      hireDate: this.formData.hireDate || this.getTodayDate(),
      shift: this.formData.shift,
      salary: Number(this.formData.salary)
    };

    // Llamada única al servicio unificado
    this.employeeService.createEmployee(requestData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/employees']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar el empleado. Verifique si el DNI, email o nombre de usuario ya existen.';
        this.cdr.markForCheck();
        console.error(err);
      }
    });
  }
}