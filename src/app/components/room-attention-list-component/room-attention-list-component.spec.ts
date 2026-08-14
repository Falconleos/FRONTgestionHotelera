import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAttentionListComponent } from './room-attention-list-component';

describe('RoomAttentionListComponent', () => {
  let component: RoomAttentionListComponent;
  let fixture: ComponentFixture<RoomAttentionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAttentionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAttentionListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
