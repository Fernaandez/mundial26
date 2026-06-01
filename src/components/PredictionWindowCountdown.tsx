"use client";

import { useEffect, useState } from "react";
import { Match } from "@/types";
import {
  getPredictionCountdown,
  PredictionCountdown,
  PredictionWindowTarget,
} from "@/lib/prediction-deadlines";

interface PredictionWindowCountdownProps {
  matches: Match[];
  target: PredictionWindowTarget;
  label: string;
  hidden?: boolean;
  className?: string;
}

export function PredictionWindowCountdown({
  matches,
  target,
  label,
  hidden = false,
  className = "",
}: PredictionWindowCountdownProps) {
  const [info, setInfo] = useState<PredictionCountdown | null>(() =>
    getPredictionCountdown(matches, target, label)
  );

  useEffect(() => {
    function tick() {
      setInfo(getPredictionCountdown(matches, target, label));
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [matches, target, label]);

  if (hidden || !info) return null;

  const tone =
    info.status === "open"
      ? "border-gold-500/30 bg-gold-500/10 text-gold-100"
      : info.status === "upcoming"
        ? "border-pitch-600/50 bg-pitch-900/40 text-pitch-200"
        : "border-pitch-700/50 bg-pitch-950/50 text-pitch-400";

  return (
    <div className={`rounded-xl border px-4 py-3 mb-4 ${tone} ${className}`}>
      <p className="text-sm font-medium">{info.headline}</p>
      <p className="text-xs mt-1 opacity-80">{info.detail}</p>
    </div>
  );
}
