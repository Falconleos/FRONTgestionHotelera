// Si querés poder subir imágenes al crear, agregale este campo
export interface RoomDTORequest {
  number: number;
  roomTypeId: number;
  state?: string;
  images?: File[]; // Este campo permite enviar la lista de imágenes
}