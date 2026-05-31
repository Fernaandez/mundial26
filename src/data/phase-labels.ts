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

/** Subtítol al quadre: tries per ronda i destinació */
export const BRACKET_ROUND_HINTS: Partial<Record<Phase, string>> = {
  round32: "16 tries · classifiquen a vuitens",
  round16: "8 tries · passen a quarts",
  quarter: "4 tries · passen a semis",
  semi: "2 tries · passen a la final",
  third: "Guanyador 3r lloc",
  final: "Campió",
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
