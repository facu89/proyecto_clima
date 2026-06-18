"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureProps {
  title: string;
  icon?: React.ReactNode;
  theme: {
    border: string;
    glowColor: string;
    accentIcon: string;
    accentIconStrong: string;
  };
  isMobile?: boolean;
  children?: React.ReactNode;
}

export default function Feature({ title, icon, theme, isMobile, children }: FeatureProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl transition-all duration-700 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: isMobile ? "blur(4px)" : "blur(16px)",
        WebkitBackdropFilter: isMobile ? "blur(4px)" : "blur(16px)",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className={cn("p-3 rounded-full", theme.accentIconStrong)}
              style={{ background: theme.glowColor.replace("0.45", "0.25") }}
            >
              {icon}
            </div>
          )}
          <p className="font-semibold text-white text-left">{title}</p>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-white/60 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-white/70">
              {children ?? <p className="text-sm">Contenido próximamente.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
