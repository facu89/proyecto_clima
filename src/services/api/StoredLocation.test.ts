import { describe, it, expect, vi } from 'vitest';
import { StoredLocation } from './StoredLocation';
import { ILocation, Coordinates, isValidCoordinates } from './ILocation';
import { LocationStorage } from '../LocationStorage';

class FakeStorage {
  private value: Coordinates | null = null;
  saved: Coordinates | null = null;
  preset(c: Coordinates | null) { this.value = c; }
  load() { return this.value; }
  save(c: Coordinates) { this.value = c; this.saved = c; }
  clear() { this.value = null; this.saved = null; }
}

const COMODORO: Coordinates = { lat: -45.86, lon: -67.48 };
const BUENOS_AIRES: Coordinates = { lat: -34.6, lon: -58.38 };

describe('CU5 - Obtener ubicación', () => {
  it('valida que la ubicación obtenida sea geográficamente posible', () => {
    expect(isValidCoordinates(COMODORO)).toBe(true);
    expect(isValidCoordinates({ lat: 91, lon: 0 })).toBe(false);
    expect(isValidCoordinates(null)).toBe(false);
  });

  it('reutiliza la ubicación almacenada sin volver a geolocalizar', async () => {
    const storage = new FakeStorage();
    storage.preset(BUENOS_AIRES);
    const geolocate = vi.fn();
    const location = new StoredLocation(
      storage as unknown as LocationStorage,
      { getLocation: geolocate } as ILocation
    );

    const result = await location.getLocation();

    expect(result).toEqual(BUENOS_AIRES);
    expect(geolocate).not.toHaveBeenCalled();
  });

  it('si no hay ubicación guardada, geolocaliza y la persiste para la próxima vez', async () => {
    const storage = new FakeStorage();
    const location = new StoredLocation(
      storage as unknown as LocationStorage,
      { getLocation: async () => COMODORO } as ILocation
    );

    const result = await location.getLocation();

    expect(result).toEqual(COMODORO);
    expect(storage.saved).toEqual(COMODORO);
  });

  it('rechaza una geolocalización inválida y no la almacena', async () => {
    const storage = new FakeStorage();
    const location = new StoredLocation(
      storage as unknown as LocationStorage,
      { getLocation: async () => ({ lat: 999, lon: 0 }) } as ILocation
    );

    await expect(location.getLocation()).rejects.toThrow();
    expect(storage.saved).toBeNull();
  });
});
