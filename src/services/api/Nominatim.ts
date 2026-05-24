export class ApiNominatim {
  async getCityName(lat: number, lon: number): Promise<string> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'es' } }
    );
    if (!res.ok) throw new Error('Failed to fetch city name');
    const data = await res.json();
    const { city, town, village, state } = data.address ?? {};
    const place = city ?? town ?? village ?? 'Ubicación desconocida';
    return state ? `${place}, ${state}` : place;
  }
}
