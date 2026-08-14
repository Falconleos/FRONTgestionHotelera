import { Injectable } from '@angular/core';
import { RoomDtoResponse } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  private selectedRoomData: {
    checkIn: string;
    checkOut: string;
    guestCount: number;
    room: RoomDtoResponse;
  } | null = null;

  setBookingData(data: { checkIn: string; checkOut: string; guestCount: number; room: RoomDtoResponse }) {
    this.selectedRoomData = data;
  }

  getBookingData() {
    return this.selectedRoomData;
  }

  clear() {
    this.selectedRoomData = null;
  }
}