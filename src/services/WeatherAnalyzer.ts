import { OpenMeteoResponse } from './weather';

export type SkyStateLabel = 'Despejado' | 'Parcialmente nublado' | 'Nublado';
export type ActivityLabel = 'Deseable' | 'Bueno' | 'Malo';

export interface SkyState {
  label: SkyStateLabel;
  cloudCover: number;
  detail: string;
}

export interface ActivityCondition {
  label: ActivityLabel;
  detail: string;
}

export class WeatherAnalyzer {
  /** Clasifica el estado del cielo según el porcentaje de nubosidad. */
  getSkyState(data: OpenMeteoResponse, hour: number): SkyState {
    const cloudCover = data.hourly.cloud_cover[hour];

    let label: SkyStateLabel;
    if (cloudCover < 20) label = 'Despejado';
    else if (cloudCover < 70) label = 'Parcialmente nublado';
    else label = 'Nublado';

    return {
      label,
      cloudCover,
      detail: `${cloudCover}% de nubosidad`,
    };
  }

  /**
   * Clasifica la condición para realizar actividad física al aire libre.
   * Se evalúa cada factor por separado y la condición general es la del PEOR
   * factor (regla del "eslabón más débil"): un solo factor en rango malo
   * — p. ej. una temperatura extrema — vuelve toda la condición "Malo",
   * sin importar lo bueno que sea el resto.
   */
  getActivityCondition(data: OpenMeteoResponse, hour: number): ActivityCondition {
    const temp = data.hourly.temperature_2m[hour];
    const wind = data.hourly.wind_speed_10m[hour];
    const rain = data.hourly.precipitation_probability[hour];
    const uv   = data.hourly.uv_index[hour];

    const rank: Record<ActivityLabel, number> = { Deseable: 0, Bueno: 1, Malo: 2 };

    // Temperatura (°C): ideal 12–24
    const rateTemp = (t: number): ActivityLabel =>
      t >= 12 && t <= 24 ? 'Deseable' : t >= 3 && t <= 31 ? 'Bueno' : 'Malo';
    // Viento (km/h)
    const rateWind = (w: number): ActivityLabel =>
      w < 15 ? 'Deseable' : w <= 35 ? 'Bueno' : 'Malo';
    // Probabilidad de lluvia (%)
    const rateRain = (r: number): ActivityLabel =>
      r < 20 ? 'Deseable' : r <= 55 ? 'Bueno' : 'Malo';
    // Índice UV
    const rateUv = (u: number): ActivityLabel =>
      u < 6 ? 'Deseable' : u < 8 ? 'Bueno' : 'Malo';

    const factors = [
      { name: 'la temperatura',           rating: rateTemp(temp) },
      { name: 'el viento',                rating: rateWind(wind) },
      { name: 'la probabilidad de lluvia', rating: rateRain(rain) },
      { name: 'el índice UV',             rating: rateUv(uv) },
    ];

    // El peor factor determina la condición general.
    const worst = factors.reduce((a, b) => (rank[b.rating] > rank[a.rating] ? b : a));
    const label = worst.rating;

    let detail: string;
    if (label === 'Deseable') {
      detail = 'Condiciones ideales para salir a caminar o correr.';
    } else if (label === 'Bueno') {
      detail = `Condiciones aceptables, aunque ${worst.name} no es la óptima.`;
    } else {
      detail = `No es recomendable salir: ${worst.name} está fuera de rango.`;
    }

    return { label, detail };
  }
}
