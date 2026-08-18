export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | string;

export interface EmployeeDtoResponse {
  id: number;
  emergencyPhoneNumber: string;
  employeeNumber: string;
  hireDate: string;
  shift: ShiftType;
  salary: number;
  username: string;
  name: string;
  surname: string;
  email: string;
}
