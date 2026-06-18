"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DayTabsProps {
  theme: {
    border: string;
    glowColor: string;
  };
  isMobile?: boolean;
  selected: number;
  onSelect: (day: number) => void;
}

export default function DayTabs({ theme, isMobile, selected, onSelect }: DayTabsProps) {
  // index 0 = "Hoy" (determinista, evita hydration mismatch)
  const [days, setDays] = useState<string[]>(() => {
    const arr = Array(7).fill("");
    arr[0] = "Hoy";
    return arr;
  });

  useEffect(() => {
    const today = new Date();
    const names = Array.from({ length: 7 }, (_, i) => {
      if (i === 0) return "Hoy";
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const name = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
    setDays(names);
  }, []);

  return (
    <div
      className="rounded-2xl p-1.5 grid grid-cols-7 gap-1"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: isMobile ? "blur(4px)" : "blur(16px)",
        WebkitBackdropFilter: isMobile ? "blur(4px)" : "blur(16px)",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {days.map((day, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            "py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 truncate",
            selected === i ? "text-white" : "text-white/45 hover:text-white/80"
          )}
          style={
            selected === i
              ? {
                  background: theme.glowColor.replace("0.45", "0.18"),
                  border: `1px solid ${theme.border}`,
                }
              : { border: "1px solid transparent" }
          }
        >
          {day || "·"}
        </button>
      ))}
    </div>
  );
}
