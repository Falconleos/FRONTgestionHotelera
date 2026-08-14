import { BookingDtoResponse } from './booking.model';
import { UserDtoResponse } from './user.model';
import { EmployeeDtoResponse } from './employee.model';

export type CheckInState = 'CURRENTLY_ACTIVE' | 'COMPLETED' | 'INTERRUPTED' | string;

export interface CheckInDtoResponse {
  id: number;
  booking?: BookingDtoResponse;
  user?: UserDtoResponse;
  employee?: EmployeeDtoResponse;
  checkInState: CheckInState;
  total: number;
  paid: boolean;
  active: boolean;
}