  export interface PaymentDTOResponse {
    id: number;
    accountId?: number;
    bookingId?: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionReference: string;
    userName?: string;
    userSurname?: string;
    registeredByName?: string;    // <-- Agregado
    registeredBySurname?: string; // <-- Agregado
  }

  export interface PaymentDTORequest {
    accountId?: number;   // Ahora opcional
    bookingId?: number;   // Nuevo campo opcional para señas
    amount: number;
    paymentMethod: string;
    transactionReference: string;
  }