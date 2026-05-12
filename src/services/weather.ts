import { APIOpenMeteo } from './api/APIOpenMeteo';

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  uv_index: number[];
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
  constructor(private api: APIOpenMeteo = new APIOpenMeteo()) {}

  async getWeatherData(lat = -45.86, lon = -67.48): Promise<OpenMeteoResponse> {
    return this.api.fetchWeatherData(lat, lon);
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
