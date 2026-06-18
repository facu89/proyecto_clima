export class ApiNominatim {
  async getCityName(lat: number, lon: number): Promise<string> {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'es' } }
    );
    if (!res.ok) throw new Error('Failed to fetch city name');
    const data = await res.json();
    const { city, town, village, state } = data.address ?? {};
    const raw = city ?? town ?? village ?? 'Ubicación desconocida';
    // Quita prefijos administrativos que alargan el nombre (Municipio de, Partido de, etc.)
    const place = raw.replace(/^(Municipio de|Departamento|Partido de|Comuna de|Localidad de)\s+/i, '');
    return state ? `${place}, ${state}` : place;
  }
}
