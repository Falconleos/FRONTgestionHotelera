export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | string;

export interface EmployeeDtoRequest {
  userId: number;
  employeeNumber?: string;
  emergencyPhoneNumber?: string;
  hireDate: string; // Formato 'yyyy-MM-dd' (LocalDate de Java)
  shift: ShiftType;
  salary: number;
}