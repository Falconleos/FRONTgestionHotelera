import { UserDtoResponse } from './user.model';

export type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT' | string; // Ajusta según tus enums de Java

export interface EmployeeDtoResponse {
  id: number;
  user: UserDtoResponse;
  shift: Shift;
  salary: number;
}