import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAttentionFormComponent } from './room-attention-form-component';

describe('RoomAttentionFormComponent', () => {
  let component: RoomAttentionFormComponent;
  let fixture: ComponentFixture<RoomAttentionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomAttentionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomAttentionFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
