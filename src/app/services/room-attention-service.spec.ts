import { TestBed } from '@angular/core/testing';

import { RoomAttentionService } from './room-attention-service';

describe('RoomAttentionService', () => {
  let service: RoomAttentionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomAttentionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
