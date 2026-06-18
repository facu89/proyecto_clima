import { APIOpenMeteo } from './api/APIOpenMeteo';
import { ILocation, Coordinates } from './api/ILocation';
import { StoredLocation } from './api/StoredLocation';
import { ApiNominatim } from './api/Nominatim';

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  uv_index: number[];
  cloud_cover: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: Record<string, string>;
  hourly: OpenMeteoHourly;
}

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
  realValue: number;
  unit: string;
}

export class WeatherAdapter {
  private lastCoords: Coordinates = { lat: -45.86, lon: -67.48 };

  constructor(
    private api: APIOpenMeteo = new APIOpenMeteo(),
    private location: ILocation = new StoredLocation(),
    private nominatim: ApiNominatim = new ApiNominatim()
  ) {}

  setLocation(location: ILocation): void {
    this.location = location;
  }

  async getWeatherData(): Promise<OpenMeteoResponse> {
    const DEFAULT: Coordinates = { lat: -45.86, lon: -67.48 };
    this.lastCoords = await this.location.getLocation().catch(() => DEFAULT);
    return this.api.fetchWeatherData(this.lastCoords.lat, this.lastCoords.lon);
  }

  async getCityName(): Promise<string> {
    return this.nominatim.getCityName(this.lastCoords.lat, this.lastCoords.lon);
  }

  normalizeRadarData(data: OpenMeteoResponse, hourIndex: number): RadarDataPoint[] {
    const hourly = data.hourly;
    const temp = hourly.temperature_2m[hourIndex];
    const wind = hourly.wind_speed_10m[hourIndex];
    const hum  = hourly.relative_humidity_2m[hourIndex];
    const rain = hourly.precipitation_probability[hourIndex];
    const uv   = hourly.uv_index[hourIndex];

    const normalize = (value: number, max: number) =>
      Math.min(Math.max((value / max) * 100, 0), 100);

    return [
      { subject: 'Temperatura',  A: normalize(temp, 40),  fullMark: 100, realValue: temp, unit: '°C'   },
      { subject: 'Viento',       A: normalize(wind, 100), fullMark: 100, realValue: wind, unit: 'km/h' },
      { subject: 'Humedad',      A: normalize(hum,  100), fullMark: 100, realValue: hum,  unit: '%'    },
      { subject: 'Prob. Lluvia', A: normalize(rain, 100), fullMark: 100, realValue: rain, unit: '%'    },
      { subject: 'Índice UV',    A: normalize(uv,   12),  fullMark: 100, realValue: uv,   unit: ''     },
    ];
  }
}
