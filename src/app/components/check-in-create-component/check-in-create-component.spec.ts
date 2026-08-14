import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInCreateComponent } from './check-in-create-component';

describe('CheckInCreateComponent', () => {
  let component: CheckInCreateComponent;
  let fixture: ComponentFixture<CheckInCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
