import { Match, Phase } from "@/types";
import { PHASE_LABELS } from "@/data/world-cup-2026";

const DISPLAY_TZ = "Europe/Madrid";
const LOCALE = "ca-ES";

export interface FormattedKickoff {
  date: string;
  time: string;
  weekday: string;
  full: string;
  sortKey: string;
}

export function formatMatchKickoff(iso?: string): FormattedKickoff | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const weekday = d.toLocaleDateString(LOCALE, { weekday: "long", timeZone: DISPLAY_TZ });
  const date = d.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DISPLAY_TZ,
  });
  const time = d.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TZ,
  });

  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return {
    weekday: cap,
    date,
    time: `${time}h`,
    full: `${cap}, ${date} · ${time}h`,
    sortKey: d.toISOString(),
  };
}

export function formatKickoffDayKey(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DISPLAY_TZ,
  });
}

export function compareMatchesByKickoff(a: Match, b: Match): number {
  const ka = a.date ? new Date(a.date).getTime() : Infinity;
  const kb = b.date ? new Date(b.date).getTime() : Infinity;
  if (ka !== kb) return ka - kb;
  return a.id.localeCompare(b.id);
}

export function groupMatchesByDay(matches: Match[]): { day: string; matches: Match[] }[] {
  const sorted = [...matches].filter((m) => m.date).sort(compareMatchesByKickoff);
  const map = new Map<string, Match[]>();

  for (const m of sorted) {
    const day = formatKickoffDayKey(m.date!);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(m);
  }

  return Array.from(map.entries()).map(([day, dayMatches]) => ({ day, matches: dayMatches }));
}

export function phaseLabel(phase: Phase): string {
  return PHASE_LABELS[phase] ?? phase;
}
