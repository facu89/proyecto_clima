"use client";

import { useEffect, useState, useMemo } from "react";
import { getWeatherData, normalizeRadarData, OpenMeteoResponse } from "@/services/weather";
import WeatherRadar from "./radar";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Wind, Thermometer, Droplets, MapPin, Clock, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Theme config ─────────────────────────────────────────────
const THEME = {
  orange: {
    bg: "linear-gradient(145deg, #431407 0%, #7c2d12 20%, #c2410c 50%, #ea580c 75%, #fb923c 100%)",
    orb1: "rgba(251,146,60,0.18)",
    orb2: "rgba(220,38,38,0.12)",
    radarColor: "#fb923c",
    glowColor: "rgba(251,146,60,0.45)",
    border: "rgba(251,146,60,0.28)",
    accentText: "text-orange-300",
    accentIcon: "text-orange-400",
    sliderClass:
      "[&_[role=slider]]:border-orange-400 [&_[role=slider]]:text-orange-400 text-orange-400",
    label: "Clima Cálido",
  },
  blue: {
    bg: "linear-gradient(145deg, #0c0f1d 0%, #0f172a 20%, #1e3a8a 50%, #1d4ed8 75%, #3b82f6 100%)",
    orb1: "rgba(96,165,250,0.18)",
    orb2: "rgba(99,102,241,0.12)",
    radarColor: "#60a5fa",
    glowColor: "rgba(96,165,250,0.45)",
    border: "rgba(96,165,250,0.28)",
    accentText: "text-blue-300",
    accentIcon: "text-blue-400",
    sliderClass:
      "[&_[role=slider]]:border-blue-400 [&_[role=slider]]:text-blue-400 text-blue-400",
    label: "Clima Fresco",
  },
} as const;

type ThemeKey = keyof typeof THEME;

// ── Sub-components ────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  theme: (typeof THEME)[ThemeKey];
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center justify-between transition-all duration-700"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn("p-3 rounded-full", theme.accentIcon)}
          style={{ background: theme.glowColor.replace("0.45", "0.15") }}
        >
          {icon}
        </div>
        <p className="font-semibold text-white/65">{label}</p>
      </div>
      {value === null ? (
        <Skeleton className="w-16 h-6" />
      ) : (
        <p className="text-xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function WeatherDashboard() {
  const [data, setData] = useState<OpenMeteoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());

  useEffect(() => {
    async function loadData() {
      try {
        const weather = await getWeatherData(-45.86, -67.48);
        setData(weather);
      } catch {
        setError("Error al cargar los datos del clima");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const hourlyData = data?.hourly;
  const currentTemp = hourlyData?.temperature_2m[selectedHour] ?? 0;

  const themeKey: ThemeKey = useMemo(
    () => (currentTemp > 15 ? "orange" : "blue"),
    [currentTemp]
  );
  const theme = THEME[themeKey];

  const radarData = useMemo(
    () => (data ? normalizeRadarData(data, selectedHour) : []),
    [data, selectedHour]
  );

  if (error) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center text-red-300 p-4 text-center"
        style={{ background: THEME.blue.bg }}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden transition-all duration-1000 ease-in-out"
      style={{ background: theme.bg }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-3xl animate-orb-a"
          style={{ background: theme.orb1, top: "-25%", right: "-15%" }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl animate-orb-b"
          style={{ background: theme.orb2, bottom: "-15%", left: "-10%" }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-4xl space-y-6 relative z-10 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Radar Climático
            </h1>
            <p className={cn("flex items-center gap-2 mt-2 font-medium", theme.accentText)}>
              <MapPin className="w-4 h-4" />
              Comodoro Rivadavia, Chubut
            </p>
          </div>

          {/* Clock badge */}
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl self-start md:self-auto"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `1px solid ${theme.border}`,
            }}
          >
            <Clock className={cn("w-5 h-5", theme.accentIcon)} />
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {selectedHour.toString().padStart(2, "0")}:00
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Radar Card ── */}
          <div
            className="lg:col-span-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-700"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${theme.border}`,
              boxShadow: `0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`,
            }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-white/55 tracking-wide uppercase text-xs">
                Proyección del estado del tiempo
              </h2>
              {themeKey === "orange" ? (
                <Sun className="w-5 h-5 text-orange-400 animate-spin-slow" />
              ) : (
                <CloudRain className="w-5 h-5 text-blue-300 animate-pulse" />
              )}
            </div>

            {/* Radar */}
            {isLoading || !data ? (
              <div className="w-full h-64 sm:h-80 flex items-center justify-center">
                <Skeleton className="w-60 h-60 rounded-full" />
              </div>
            ) : (
              <WeatherRadar
                data={radarData}
                color={theme.radarColor}
                glowColor={theme.glowColor}
              />
            )}

            {/* Timeline Slider */}
            <div className="mt-6 px-1">
              <div className="flex justify-between text-xs font-semibold text-white/30 mb-3 select-none">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
              <Slider
                disabled={isLoading}
                value={[selectedHour]}
                max={23}
                step={1}
                onValueChange={(vals) => setSelectedHour(vals[0])}
                className={cn("cursor-pointer", theme.sliderClass)}
              />
            </div>
          </div>

          {/* ── Side cards ── */}
          <div className="flex flex-col gap-4">
            <InfoCard
              icon={<Thermometer strokeWidth={2} className="w-5 h-5" />}
              label="Temperatura"
              value={isLoading ? null : `${currentTemp}°C`}
              theme={theme}
            />
            <InfoCard
              icon={<Wind strokeWidth={2} className="w-5 h-5" />}
              label="Viento"
              value={isLoading ? null : `${hourlyData?.wind_speed_10m[selectedHour]} km/h`}
              theme={theme}
            />
            <InfoCard
              icon={<Droplets strokeWidth={2} className="w-5 h-5" />}
              label="Humedad"
              value={isLoading ? null : `${hourlyData?.relative_humidity_2m[selectedHour]}%`}
              theme={theme}
            />

            <InfoCard
              icon={<CloudRain strokeWidth={2} className="w-5 h-5" />}
              label="Prob. Lluvia"
              value={isLoading ? null : `${hourlyData?.precipitation_probability[selectedHour]}%`}
              theme={theme}
            />
            <InfoCard
              icon={<Sun strokeWidth={2} className="w-5 h-5" />}
              label="Índice UV"
              value={isLoading ? null : `${hourlyData?.uv_index[selectedHour]}`}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
