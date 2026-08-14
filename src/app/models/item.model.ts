export interface ItemDtoResponse {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  isService?: boolean;
}

export interface ItemDtoRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  isService?: boolean;
}