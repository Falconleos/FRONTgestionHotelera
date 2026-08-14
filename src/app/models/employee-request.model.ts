export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | string;

export interface EmployeeDtoRequest {
  userId: number;
  shift: ShiftType;
  salary: number;
}