import { TestBed } from '@angular/core/testing';

import { FirestoreData } from './firestore-data';

describe('FirestoreData', () => {
  let service: FirestoreData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
