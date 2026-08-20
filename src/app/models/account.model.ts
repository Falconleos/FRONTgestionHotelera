import { PaymentDTOResponse } from './payment.model';

export interface AccountDTOResponse {
  id: number;
  bookingId: number;
  baseAmount: number;
  servicesTotal?: number;          // Añadido para que coincida con el backend
  totalAmount?: number;            // Calculado o mapeado en la vista/backend
  paidAmount: number;
  remainingBalance?: number;       // Calculado o mapeado en la vista/backend
  isPaid: boolean;
  adjustmentPercentage: number;
  payments: PaymentDTOResponse[];
  user?: {
    name: string;
    surname: string;
    dni: string;
  };
  roomNumber?: string | number;
  checkInDate?: string;
  checkOutDate?: string;
  items?: {
    description: string;
    quantity: number;
    subtotal: number;
  }[];
}