import { ILocation, Coordinates } from './ILocation';

export interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

export class ApiMapa implements ILocation {
  private selectedCoords: Coordinates | null = null;

  selectLocation(lat: number, lon: number): void {
    this.selectedCoords = { lat, lon };
  }

  async searchSuggestions(query: string, limit = 5): Promise<LocationSuggestion[]> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) throw new Error('Mapbox token no configurado');
    if (!query.trim()) return [];

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=${limit}&language=es&types=place,locality,region`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al buscar la ubicación');

    const data = await res.json();
    return (data.features ?? []).map((f: any) => ({
      name: f.place_name,
      lon: f.center[0],
      lat: f.center[1],
    }));
  }

  async searchLocation(query: string): Promise<Coordinates> {
    const results = await this.searchSuggestions(query, 1);
    if (!results.length) throw new Error('No se encontraron resultados');
    this.selectedCoords = { lat: results[0].lat, lon: results[0].lon };
    return this.selectedCoords;
  }

  async getLocation(): Promise<Coordinates> {
    if (!this.selectedCoords) {
      throw new Error('No hay una ubicación seleccionada en el mapa');
    }
    return this.selectedCoords;
  }
}
