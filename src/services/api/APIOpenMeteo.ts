import { OpenMeteoResponse } from '../weather';

export async function fetchWeatherData(lat: number = -45.86, lon: number = -67.48): Promise<OpenMeteoResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,uv_index&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}
