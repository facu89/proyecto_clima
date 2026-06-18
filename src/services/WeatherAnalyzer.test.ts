import { describe, it, expect } from 'vitest';
import { WeatherAnalyzer } from './WeatherAnalyzer';
import type { OpenMeteoResponse } from './weather';

const analyzer = new WeatherAnalyzer();

function makeData(values: {
  temp?: number; wind?: number; humidity?: number; rain?: number; uv?: number; cloud?: number;
}): OpenMeteoResponse {
  return {
    hourly: {
      time: ['2026-06-14T00:00'],
      temperature_2m: [values.temp ?? 20],
      relative_humidity_2m: [values.humidity ?? 50],
      precipitation_probability: [values.rain ?? 0],
      wind_speed_10m: [values.wind ?? 5],
      uv_index: [values.uv ?? 1],
      cloud_cover: [values.cloud ?? 0],
    },
  } as OpenMeteoResponse;
}

describe('CU2 - Estado del cielo', () => {
  it('con poca nubosidad el cielo se reporta como "Despejado"', () => {
    expect(analyzer.getSkyState(makeData({ cloud: 10 }), 0).label).toBe('Despejado');
  });

  it('con mucha nubosidad el cielo se reporta como "Nublado"', () => {
    expect(analyzer.getSkyState(makeData({ cloud: 90 }), 0).label).toBe('Nublado');
  });
});

describe('CU3 - Condición para actividad física', () => {
  it('con todos los factores en rango ideal la condición es "Deseable"', () => {
    const data = makeData({ temp: 20, wind: 5, rain: 0, uv: 1 });
    expect(analyzer.getActivityCondition(data, 0).label).toBe('Deseable');
  });

  it('un único factor extremo vuelve la condición "Malo" (eslabón más débil)', () => {
    const data = makeData({ temp: -70, wind: 5, rain: 0, uv: 0 });
    const result = analyzer.getActivityCondition(data, 0);
    expect(result.label).toBe('Malo');
    expect(result.detail).toContain('la temperatura');
  });
});
