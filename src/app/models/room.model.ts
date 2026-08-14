export interface RoomDtoResponse {
  id: number;
  number: number;
  roomTypeId: number;
  roomTypeName: string;
  capacity: number;
  pricePerNight: number;
  state: string; // 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | string
}