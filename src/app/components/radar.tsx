"use client";

import { Component } from 'react';
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
          Valor: <span className="font-bold text-white">{point.realValue} {point.unit}</span>
        </p>
        <p className="text-xs text-white/35 mt-0.5">Normalizado: {Math.round(point.A)}/100</p>
      </div>
    );
  }
  return null;
};

export default class WeatherRadar extends Component<WeatherRadarProps> {
  render() {
    const { data, color, glowColor } = this.props;

    return (
      <div className="w-full h-64 sm:h-80 relative">
        {/* Pulsing glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-3xl animate-radar-pulse pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 65%)` }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={color}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full relative"
            style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
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
                  fillOpacity={0.28}
                  isAnimationActive
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Radar sweep overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="animate-radar-sweep"
                style={{ width: "57%", height: "57%", transformOrigin: "center" }}
              >
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <defs>
                    <radialGradient id="trail-grad" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
                      <stop offset="0%"   stopColor={color} stopOpacity="0.0" />
                      <stop offset="40%"  stopColor={color} stopOpacity="0.12" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </radialGradient>
                  </defs>
                  <path d="M 50 50 L 50 0 A 50 50 0 0 0 14.6 14.6 Z" fill={color} fillOpacity="0.14" />
                  <line x1="50" y1="50" x2="50" y2="1" stroke={color} strokeWidth="1.2" strokeOpacity="0.95" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="2.5" fill={color} fillOpacity="0.9" />
                  <circle cx="50" cy="3" r="2" fill={color} fillOpacity="0.7" />
                </svg>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
}
