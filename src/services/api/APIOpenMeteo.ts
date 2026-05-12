import { OpenMeteoResponse } from '../weather';

export class APIOpenMeteo {
  async fetchWeatherData(lat = -45.86, lon = -67.48): Promise<OpenMeteoResponse> {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error('Failed to fetch weather data');
    return res.json();
  }
}
