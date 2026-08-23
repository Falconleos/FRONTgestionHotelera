export interface ItemDtoResponse {
  id: number;
  description: string;
  unitPrice: number;
  isService: boolean;
  quantity: number;
}

export interface RoomAttentionDtoRequest {
  bookingId: number; // Actualizado de checkInId a bookingId
  itemId: number;
  quantity: number;
}

export interface RoomAttentionDtoResponse {
  id: number;
  bookingId: number; // Actualizado de checkInId a bookingId
  itemId: number;
  itemDTOResponse: ItemDtoResponse; // Agregado el objeto de respuesta del ítem
  isService: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  employeeUsername: string;
}