export type BookingState = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'CHECKED_IN' 
  | 'CONCLUDED' 
  | 'NO_SHOW' 
  | 'CANCELLED' 
  | 'INTERRUPTED' 
  | string;

// Modelo para CREAR o ACTUALIZAR una reserva (Basado en BookingDTORequest de Spring Boot)
export interface BookingDtoRequest {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guestFirstName: string;  // Requerido (@NotBlank en Java)
  guestLastName: string;   // Requerido (@NotBlank en Java)
  guestPhone: string;      // Requerido (@NotBlank en Java)
  userId?: number | null; 
  observation?: string;
  roomId: number;
  totalPrice: number;      // NUEVO: Requerido (@NotNull en Java)
}

// Modelo de RESPUESTA detallada (Sincronizado con BookingDTOResponse)
export interface BookingDtoResponse {
  id: number;
  checkIn: string;        
  checkOut: string;       
  guestCount: number;
  state: BookingState;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  
  // Datos del usuario registrado asociado (si aplica)
  name?: string;
  surname?: string;
  username?: string;

  qrBooking?: string;
  observation?: string;

  // Auditoría de empleados
  employeeBookingUsername?: string;
  employeeCheckInUsername?: string;

  // Habitación: el DTO Java ahora devuelve el número directamente
  roomNumber: number; 

  totalPrice: number;
  createdAt: string;      
}

export interface BookingCancellationDtoRequest {
  bookingId: number;
  reason?: string;
}