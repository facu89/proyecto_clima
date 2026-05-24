export interface Coordinates {
  lat: number;
  lon: number;
}

export interface ILocation {
  getLocation(): Promise<Coordinates>;
}
