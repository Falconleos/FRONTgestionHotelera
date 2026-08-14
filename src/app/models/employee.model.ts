import { UserDtoResponse } from './user.model';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | string; // Ajusta según tus enums de Java

export interface EmployeeDtoResponse {
  id: number;
  emergencyPhoneNumber?: string;
  employeeNumber?: string;
  hireDate: string;
  shift: ShiftType;
  salary: number;
  // Campos aplanados que vienen directamente en el EmployeeDTOResponse de Java
  username: string;
  name: string;
  surname: string;
  email: string;
}