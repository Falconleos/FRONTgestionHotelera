export interface RoomTypeDTOResponse {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  pricePerNight: number;
}

export interface RoomTypeDTORequest {
  name: string;
  capacity: number;
  description?: string;
  pricePerNight: number;
}