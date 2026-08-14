import { PaymentDTOResponse } from './payment.model';

export interface AccountDTOResponse {
  id: number;
  checkInId: number;
  baseAmount: number;         // <-- Añadido aquí
  totalAmount: number;
  paidAmount: number;
  remainingBalance?: number;
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