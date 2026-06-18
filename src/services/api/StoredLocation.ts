import { ILocation, Coordinates, isValidCoordinates } from './ILocation';
import { ApiGeoLocation } from './GeoLocation';
import { LocationStorage } from '../LocationStorage';

export class StoredLocation implements ILocation {
  constructor(
    private storage: LocationStorage = new LocationStorage(),
    private fallback: ILocation = new ApiGeoLocation()
  ) {}

  async getLocation(): Promise<Coordinates> {
    // 1. Si hay una ubicación almacenada y válida, se usa esa.
    const stored = this.storage.load();
    if (isValidCoordinates(stored)) return stored;

    // 2. Si no, se obtiene por geolocalización.
    const coords = await this.fallback.getLocation();
    if (!isValidCoordinates(coords)) {
      throw new Error('La ubicación obtenida no es válida.');
    }

    // 3. Se almacena solo si es válida.
    this.storage.save(coords);
    return coords;
  }
}
