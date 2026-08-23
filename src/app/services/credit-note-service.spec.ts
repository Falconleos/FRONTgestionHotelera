import { TestBed } from '@angular/core/testing';

import { CreditNoteService } from './credit-note-service';

describe('CreditNoteService', () => {
  let service: CreditNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
