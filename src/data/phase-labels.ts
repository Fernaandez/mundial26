import { Phase, ScoreBreakdown } from "@/types";

/** Nomenclatura oficial UI — Setzens, Vuitens, Quarts… */
export const PHASE_LABELS: Record<Phase, string> = {
  special: "Prediccions especials",
  groups: "Fase de grups",
  round32: "Setzens de final",
  round16: "Vuitens de final",
  quarter: "Quarts de final",
  semi: "Semifinals",
  third: "3r lloc",
  final: "Final",
};

export const PHASE_SHORT: Partial<Record<Phase, string>> = {
  round32: "Setzens",
  round16: "Vuitens",
  quarter: "Quarts",
  semi: "Semis",
  third: "3r",
  final: "Final",
};

export const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  special: "Mundial (jugadors, seleccions, podi)",
  groups: "Grups (partits + extras)",
  advancement: "Elim. (classificats)",
  round32: "Setzens de final",
  round16: "Vuitens de final",
  quarter: "Quarts de final",
  semi: "Semifinals",
  third: "3r lloc",
  final: "Final",
};

export function phaseLabel(phase: Phase): string {
  return PHASE_LABELS[phase] ?? phase;
}
