import { RoomDtoResponse } from './room.model';
import { EmployeeDtoResponse } from './employee.model';

export type BookingState = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CONCLUDED' | 'NO_SHOW' | 'CANCELLED' | 'INTERRUPTED' | string;

export interface BookingDtoResponse {
  id: number;
  checkIn: string; // O Date
  checkOut: string; // O Date
  guestCount: number;
  state: BookingState;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  observation?: string;
  employee?: EmployeeDtoResponse;
  room?: RoomDtoResponse;
  totalPrice: number;
  active: boolean;
  createdAt: string;
}

export interface BookingCancellationDtoRequest {
  bookingId: number;
  reason?: string;
}