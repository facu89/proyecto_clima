"use client";

import { Component } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  theme: {
    border: string;
    glowColor: string;
    accentIcon: string;
  };
}

export default class InfoCard extends Component<InfoCardProps> {
  render() {
    const { icon, label, value, theme } = this.props;

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
}
