import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInListComponent } from './check-in-list-component';

describe('CheckInListComponent', () => {
  let component: CheckInListComponent;
  let fixture: ComponentFixture<CheckInListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
