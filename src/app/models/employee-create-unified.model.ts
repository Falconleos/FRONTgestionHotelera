// src/app/models/employee-create-unified.model.ts

export type RoleType = 'ADMIN' | 'RECEPCIONIST' | 'HOUSEKEEPING' | 'MAINTENANCE' | 'RELIEF_STAFF' | 'GUEST';
export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | string;

export interface EmployeeCreateUnifiedDTO {
  // Datos del Usuario
  username: string;
  password?: string;
  name: string;
  surname: string;
  dni: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  birthDay?: string; // Formato 'yyyy-MM-dd'
  role: RoleType;
  profilePictureFile?: File;
  enabled?: boolean;

  // Datos del Empleado
  employeeNumber?: string;
  emergencyPhoneNumber?: string;
  hireDate?: string; // Formato 'yyyy-MM-dd'
  shift: ShiftType;
  salary: number;
}