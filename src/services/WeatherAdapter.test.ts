import { describe, it, expect, vi } from 'vitest';
import { WeatherAdapter, OpenMeteoResponse } from './weather';
import { APIOpenMeteo } from './api/APIOpenMeteo';
import { ApiNominatim } from './api/Nominatim';
import { ILocation, Coordinates } from './api/ILocation';

const FAKE_RESPONSE = { hourly: { temperature_2m: [18] } } as unknown as OpenMeteoResponse;
const DEFAULT_COORDS: Coordinates = { lat: -45.86, lon: -67.48 };

function buildAdapter(opts: { coords?: Coordinates; locationFails?: boolean }) {
  const fetchWeatherData = vi.fn(async () => FAKE_RESPONSE);
  const api = { fetchWeatherData } as unknown as APIOpenMeteo;

  const location: ILocation = {
    getLocation: opts.locationFails
      ? async () => { throw new Error('geolocalización denegada'); }
      : async () => opts.coords!,
  };

  const nominatim = { getCityName: vi.fn(async () => 'Ciudad') } as unknown as ApiNominatim;

  return { adapter: new WeatherAdapter(api, location, nominatim), fetchWeatherData };
}

describe('CU1 - Actualizar estado del clima', () => {
  it('consulta el clima con las coordenadas obtenidas de la ubicación', async () => {
    const { adapter, fetchWeatherData } = buildAdapter({ coords: { lat: 10, lon: 20 } });

    const data = await adapter.getWeatherData();

    expect(fetchWeatherData).toHaveBeenCalledWith(10, 20);
    expect(data).toBe(FAKE_RESPONSE);
  });

  it('si la ubicación falla, usa coordenadas por defecto y no rompe', async () => {
    const { adapter, fetchWeatherData } = buildAdapter({ locationFails: true });

    await adapter.getWeatherData();

    expect(fetchWeatherData).toHaveBeenCalledWith(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon);
  });
});
