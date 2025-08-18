import { TestBed } from '@angular/core/testing';

import { BitmapStorageService } from './bitmap-storage.service';

describe('BitmapStorageService', () => {
  let service: BitmapStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitmapStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
