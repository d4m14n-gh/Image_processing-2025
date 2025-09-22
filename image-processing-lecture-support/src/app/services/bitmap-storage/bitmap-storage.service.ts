import { Injectable } from '@angular/core';
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';


/** Service to handle storage and retrieval of bitmaps using local storage. */
@Injectable({
  providedIn: 'root'
})
export class BitmapStorageService {
  /** Key prefix for storing bitmaps in local storage. */
  private _storageKey: string = 'bitmap-storage-';

  /** Saves a bitmap to local storage.
   * @param id The identifier for the bitmap.
   * @param bitmap The bitmap to save.
   * @see Bitmap
   */
  save(id: string, bitmap: Bitmap) {
    localStorage.setItem(this._storageKey + id, JSON.stringify(bitmap));
  }

  /** Checks if a bitmap with the given ID exists in storage.
   * @param id The identifier to check.
   * @returns True if the bitmap exists, false otherwise.
   */
  has(id: string): boolean {
    return this.load(this._storageKey + id) !== null;
  }

  /** Loads a bitmap from local storage.
   * @param id The identifier of the bitmap to load.
   * @returns The loaded bitmap, or null if not found or invalid.
   * @see Bitmap
   */
  load(id: string | null): Bitmap | null {
    if (!id) return null;
    const raw = localStorage.getItem(this._storageKey + id);
    if (!raw) return null;

    try {
      const obj = JSON.parse(raw) as any;
      if (!obj || typeof obj !== "object") return null;
      if (typeof obj._width !== "number" || typeof obj._height !== "number" || obj._matrix === undefined || obj._matrix === null) return null;
      const inst = Object.create(Bitmap.prototype) as Bitmap;
      return Object.assign(inst, obj);
    } catch {
      return null;
    }
  }
}
