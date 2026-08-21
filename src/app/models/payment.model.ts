  export interface PaymentDTOResponse {
  id: number;
  accountId?: number;
  bookingId?: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string;
  username?: string;            // <-- Cambiado de userName a username
  userSurname?: string;
  registeredByName?: string;    
  registeredBySurname?: string; 
}

  export interface PaymentDTORequest {
    accountId?: number;   // Ahora opcional
    bookingId?: number;   // Nuevo campo opcional para señas
    amount: number;
    paymentMethod: string;
    transactionReference: string;
  }