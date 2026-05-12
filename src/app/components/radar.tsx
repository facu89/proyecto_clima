"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { RadarDataPoint } from '@/services/weather';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherRadarProps {
  data: RadarDataPoint[];
  color: string;
  glowColor: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as RadarDataPoint;
    return (
      <div
        className="p-3 rounded-xl shadow-2xl"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <p className="font-semibold text-white text-sm mb-1">{point.subject}</p>
        <p className="text-xs text-white/60">
          Valor:{" "}
          <span className="font-bold text-white">
            {point.realValue} {point.unit}
          </span>
        </p>
        <p className="text-xs text-white/35 mt-0.5">
          Normalizado: {Math.round(point.A)}/100
        </p>
      </div>
    );
  }
  return null;
};

export default function WeatherRadar({ data, color, glowColor }: WeatherRadarProps) {
  return (
    <div className="w-full h-64 sm:h-80 relative">
      {/* Glow halo behind chart */}
      <div
        className="absolute inset-0 rounded-full blur-3xl animate-radar-pulse pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={color}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full relative"
          style={{ filter: `drop-shadow(0 0 12px ${color}99)` }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Clima"
                dataKey="A"
                stroke={color}
                strokeWidth={2.5}
                fill={color}
                fillOpacity={0.3}
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
