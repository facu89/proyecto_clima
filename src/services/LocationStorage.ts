import { Coordinates } from './api/ILocation';

const STORAGE_KEY = 'clima_last_location';

export class LocationStorage {
  save(coords: Coordinates): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  }

  load(): Coordinates | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Coordinates;
    } catch {
      return null;
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
