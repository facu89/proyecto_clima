import type { NextRequest } from 'next/server';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const HOURLY_FIELDS  = 'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,uv_index';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat') ?? '-45.86';
  const lon = searchParams.get('lon') ?? '-67.48';

  const url = `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&hourly=${HOURLY_FIELDS}&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    return Response.json({ error: 'Error al obtener datos de Open-Meteo' }, { status: 502 });
  }

  const data = await res.json();
  return Response.json(data);
}
