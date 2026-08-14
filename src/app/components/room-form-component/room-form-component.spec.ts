import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFormComponent } from './room-form-component';

describe('RoomFormComponent', () => {
  let component: RoomFormComponent;
  let fixture: ComponentFixture<RoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
