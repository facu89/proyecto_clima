export interface Coordinates {
  lat: number;
  lon: number;
}

export interface ILocation {
  getLocation(): Promise<Coordinates>;
}

/**
 * Valida que unas coordenadas sean geográficamente posibles:
 * latitud en [-90, 90] y longitud en [-180, 180], ambas numéricas y finitas.
 */
export function isValidCoordinates(coords: Coordinates | null | undefined): coords is Coordinates {
  return (
    !!coords &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lon) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lon >= -180 &&
    coords.lon <= 180
  );
}
