import { Injectable } from '@angular/core';
import { RoomDtoResponse } from '../models/room.model';

export interface BookingSelectionData {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  room: RoomDtoResponse;
  nights: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  private selectedRoomData: BookingSelectionData | null = null;

  setBookingData(data: BookingSelectionData) {
    this.selectedRoomData = data;
  }

  getBookingData(): BookingSelectionData | null {
    return this.selectedRoomData;
  }

  clear() {
    this.selectedRoomData = null;
  }
}