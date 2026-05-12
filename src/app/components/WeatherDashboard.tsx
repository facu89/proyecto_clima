"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { WeatherAdapter, OpenMeteoResponse } from "@/services/weather";
import WeatherRadar from "./radar";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Wind, Thermometer, Droplets, MapPin, Clock, CloudRain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Deterministic pseudo-random (avoids hydration mismatch) ──
function seededVal(i: number, offset = 0) {
  return ((Math.sin(i * 127.1 + offset * 311.7) * 43758.5453) % 1 + 1) % 1;
}

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
    bg: "linear-gradient(145deg, #1e3a8a 0%, #2563eb 30%, #3b82f6 58%, #93c5fd 82%, #dbeafe 100%)",
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

// ── Condition icons ───────────────────────────────────────────

const SUN_RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  return { x1: 50 + 37 * Math.cos(a), y1: 50 + 37 * Math.sin(a), x2: 50 + 48 * Math.cos(a), y2: 50 + 48 * Math.sin(a) };
});

function SunScene() {
  return (
    <div className="relative w-32 h-32">
      <div className="absolute rounded-full blur-3xl animate-radar-pulse" style={{ inset: "-50%", background: "rgba(251,191,36,0.22)" }} />
      <div className="absolute rounded-full blur-xl animate-radar-pulse" style={{ inset: "-15%", background: "rgba(251,191,36,0.18)", animationDelay: "1s" }} />
      <svg className="absolute animate-spin-slow" style={{ inset: "-14%", width: "128%", height: "128%" }} viewBox="0 0 100 100">
        {SUN_RAYS.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="rgba(251,191,36,0.75)" strokeWidth="2.2" strokeLinecap="round" />
        ))}
      </svg>
      <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 38% 34%, #fef9c3, #fbbf24, #f59e0b)", boxShadow: "0 0 48px rgba(251,191,36,0.9), 0 0 96px rgba(251,191,36,0.35)" }} />
    </div>
  );
}

const STARS = [
  { x: 18, y: 12, r: 2.5, delay: "0s",    dur: "2.4s" },
  { x: 72, y:  8, r: 1.8, delay: "0.9s",  dur: "3.1s" },
  { x: 88, y: 30, r: 3.0, delay: "1.6s",  dur: "2.0s" },
  { x:  8, y: 52, r: 1.6, delay: "0.4s",  dur: "3.5s" },
  { x: 58, y:  4, r: 1.8, delay: "1.3s",  dur: "2.7s" },
  { x: 40, y: 82, r: 2.2, delay: "0.7s",  dur: "2.2s" },
  { x: 82, y: 68, r: 1.5, delay: "2.0s",  dur: "3.3s" },
];

function MoonScene() {
  return (
    <div className="relative w-36 h-36">
      <div className="absolute inset-[-25%] rounded-full blur-3xl" style={{ background: "rgba(186,230,255,0.12)" }} />
      {STARS.map((s, i) => (
        <div key={i} className="absolute rounded-full animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, background: "white", boxShadow: "0 0 4px rgba(255,255,255,0.9)", animationDelay: s.delay, animationDuration: s.dur }} />
      ))}
      <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_18px_rgba(186,230,255,0.6)]" viewBox="0 0 100 100">
        <defs>
          <mask id="crescent">
            <rect width="100" height="100" fill="white" />
            <circle cx="62" cy="38" r="28" fill="black" />
          </mask>
        </defs>
        <circle cx="50" cy="52" r="28" fill="#dbeafe" fillOpacity="0.92" mask="url(#crescent)" />
        <circle cx="50" cy="52" r="28" fill="none" stroke="rgba(147,197,253,0.5)" strokeWidth="0.8" mask="url(#crescent)" />
      </svg>
    </div>
  );
}

function SunCloudScene() {
  return (
    <div className="relative w-44 h-36">
      {/* Sun behind cloud */}
      <div className="absolute top-1 right-2 w-20 h-20">
        <div className="absolute rounded-full blur-2xl animate-radar-pulse" style={{ inset: "-30%", background: "rgba(251,191,36,0.18)" }} />
        <svg className="absolute animate-spin-slow" style={{ inset: "-12%", width: "124%", height: "124%" }} viewBox="0 0 100 100">
          {SUN_RAYS.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="rgba(251,191,36,0.5)" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </svg>
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 38% 34%, #fef9c3, #fbbf24)", boxShadow: "0 0 30px rgba(251,191,36,0.7)" }} />
      </div>
      {/* Cloud floating in front */}
      <div className="absolute bottom-0 left-0 animate-float-gentle">
        <div className="relative">
          <div className="w-36 h-12 rounded-full" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(4px)" }} />
          <div className="absolute rounded-full" style={{ width: 64, height: 52, top: -22, left: 20, background: "rgba(255,255,255,0.55)" }} />
          <div className="absolute rounded-full" style={{ width: 56, height: 46, top: -16, left: 62, background: "rgba(255,255,255,0.55)" }} />
        </div>
      </div>
    </div>
  );
}

function ConditionIcon({ precipProb, hour, isWarm }: { precipProb: number; hour: number; isWarm: boolean }) {
  const isNight = hour < 6 || hour >= 21;
  const isClear = precipProb < 30;

  return (
    <AnimatePresence mode="wait">
      {isNight ? (
        <motion.div key="moon" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <MoonScene />
        </motion.div>
      ) : isWarm && isClear ? (
        <motion.div key="sun" initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
          <SunScene />
        </motion.div>
      ) : isWarm ? (
        <motion.div key="suncloud" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <SunCloudScene />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ── Rain particles — only rendered when precipProb > 30 ───────
const MAX_PARTICLES = 60;

function RainParticles({ precipProb }: { precipProb: number }) {
  // Scale particle count and opacity with actual probability
  const count   = Math.round((precipProb / 100) * MAX_PARTICLES);
  const opacity = 0.15 + (precipProb / 100) * 0.45;

  const particles = useMemo(
    () =>
      Array.from({ length: MAX_PARTICLES }, (_, i) => ({
        left:     `${seededVal(i, 0) * 100}%`,
        top:      `${seededVal(i, 1) * 100}%`,
        delay:    `${seededVal(i, 2) * 5}s`,
        duration: `${2.5 + seededVal(i, 3) * 3.5}s`,
        size:     seededVal(i, 4) > 0.6 ? 1.5 : 1,
        height:   8 + seededVal(i, 5) * 12,
      })),
    []
  );

  if (count === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.slice(0, count).map((p, i) => (
        <div
          key={i}
          className="absolute animate-rain-fall"
          style={{
            left:              p.left,
            top:               p.top,
            width:             p.size,
            height:            p.height,
            borderRadius:      "0 0 2px 2px",
            background:        `linear-gradient(to bottom, transparent, rgba(147,197,253,${opacity}))`,
            animationDelay:    p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

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
  const adapter = useRef(new WeatherAdapter());
  const [data, setData] = useState<OpenMeteoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());

  useEffect(() => {
    async function loadData() {
      try {
        const weather = await adapter.current.getWeatherData(-45.86, -67.48);
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

  const isNight = selectedHour < 6 || selectedHour >= 21;

  const radarData = useMemo(
    () => (data ? adapter.current.normalizeRadarData(data, selectedHour) : []),
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

      {/* Night overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ background: "rgba(0,0,15,0.5)", opacity: isNight ? 1 : 0 }}
      />

      {/* Rain particles — driven by actual precipitation probability */}
      <RainParticles precipProb={hourlyData?.precipitation_probability[selectedHour] ?? 0} />

      {/* Condition icon — top-right background decoration */}
      <div className="absolute top-6 right-6 md:top-10 md:right-14 pointer-events-none" style={{ zIndex: 1 }}>
        <ConditionIcon
          precipProb={hourlyData?.precipitation_probability[selectedHour] ?? 0}
          hour={selectedHour}
          isWarm={themeKey === "orange"}
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
            className="lg:col-span-2 rounded-3xl p-6 flex flex-col justify-between transition-all duration-700 animate-card-glow"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${theme.border}`,
              ["--glow" as any]: theme.glowColor,
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
