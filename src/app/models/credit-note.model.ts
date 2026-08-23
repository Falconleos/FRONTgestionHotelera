// Modelo basado en CreditNoteDTORequest de Java
export interface CreditNoteDtoRequest {
  accountId: number;
  amount: number;
}

// Modelo basado en CreditNoteDTOResponse de Java
export interface CreditNoteDtoResponse {
  id: number;
  accountId: number;
  amount: number;
  reason: string;
  issuedAt: string; // En Angular las fechas se suelen manejar como string (ISO)
}