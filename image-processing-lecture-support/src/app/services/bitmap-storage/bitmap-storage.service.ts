import { Injectable } from '@angular/core';
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';

@Injectable({
  providedIn: 'root'
})
export class BitmapStorageService {
  private _storageKey: string = 'bitmap-storage-';
  constructor() {}

  
  save(id: string, bitmap: Bitmap) {
    localStorage.setItem(this._storageKey + id, JSON.stringify(bitmap));
  }

  has(id: string): boolean {
    return this.load(this._storageKey + id) !== null;
  }

  load(id: string | null): Bitmap | null {
    if (!id) return null;
    const raw = localStorage.getItem(this._storageKey + id);
    if (!raw) return null;

    try {
      const obj = JSON.parse(raw) as any;
      if (!obj || typeof obj !== 'object') return null;
      const inst = Object.create(Bitmap.prototype) as Bitmap;
      return Object.assign(inst, obj);
    } catch {
      return null;
    }
  }
}
