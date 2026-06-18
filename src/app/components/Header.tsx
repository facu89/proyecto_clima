"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  theme: {
    border: string;
    glowColor: string;
    accentText: string;
    accentIcon: string;
  };
  isMobile?: boolean;
}

const CITIES = [
  { name: "Buenos Aires", tz: "America/Argentina/Buenos_Aires" },
  { name: "La Habana", tz: "America/Havana" },
  { name: "San Salvador", tz: "America/El_Salvador" },
  { name: "Londres", tz: "Europe/London" },
  { name: "Madrid", tz: "Europe/Madrid" },
  { name: "Nueva York", tz: "America/New_York" },
  { name: "Ciudad de México", tz: "America/Mexico_City" },
  { name: "París", tz: "Europe/Paris" },
  { name: "Tokio", tz: "Asia/Tokyo" },
  { name: "Sídney", tz: "Australia/Sydney" },
];

const ROTATE_MS = 3500;

export default function Header({ theme, isMobile }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [index, setIndex] = useState(0);

  // El reloj se calcula solo en el cliente (evita hydration mismatch).
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    const rotate = setInterval(() => setIndex((i) => (i + 1) % CITIES.length), ROTATE_MS);
    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, []);

  const city = CITIES[index];
  const time =
    mounted && now
      ? new Intl.DateTimeFormat("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: city.tz,
        }).format(now)
      : "--:--";

  return (
    <header
      className="w-full rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-3 transition-all duration-700"
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: isMobile ? "blur(4px)" : "blur(18px)",
        WebkitBackdropFilter: isMobile ? "blur(4px)" : "blur(18px)",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Marca */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div
          className={cn("p-2 rounded-xl", theme.accentIcon)}
          style={{ background: theme.glowColor.replace("0.45", "0.16") }}
        >
          <CloudSun className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <span className="text-xl font-black tracking-tight text-white">
          Clima<span className={theme.accentText}>Web</span>
        </span>
      </div>

      {/* Reloj mundial rotativo */}
      <div className="relative h-9 flex items-center overflow-hidden min-w-0" style={{ minWidth: isMobile ? 76 : 150 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={city.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-end leading-tight w-full min-w-0"
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider text-white/75 truncate max-w-full"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
            >
              {city.name}
            </span>
            <span className="text-lg font-bold font-mono tracking-tight text-white tabular-nums">
              {time}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </header>
  );
}
