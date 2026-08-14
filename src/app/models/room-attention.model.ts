export interface RoomAttentionDtoRequest {
  checkInId: number;
  itemId: number;
  quantity: number;
}

export interface RoomAttentionDtoResponse {
  id: number;
  checkInId: number;
  itemId: number;
  itemDescription: string;
  isService: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  employeeUsername: string;
}