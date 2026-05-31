import { Match, Phase } from "@/types";
import { compareMatchesByKickoff, formatMatchKickoff } from "@/lib/match-dates";
import { PredictionWindows, isKnockoutPhase } from "@/lib/phases";

const KO_PREDICTION_ORDER: Phase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

const PHASE_DEADLINE_LABELS: Record<Phase, string> = {
  special: "Prediccions especials (Mundial)",
  groups: "Grups",
  round32: "32ens de final",
  round16: "16ens de final",
  quarter: "Quarts de final",
  semi: "Semifinals",
  third: "3r lloc",
  final: "Final",
};

function phaseMatches(matches: Match[], phase: Phase): Match[] {
  return matches.filter((m) => m.phase === phase && m.date).sort(compareMatchesByKickoff);
}

function firstKickoff(matches: Match[], phase: Phase): Date | null {
  const list = phaseMatches(matches, phase);
  if (list.length === 0) return null;
  return new Date(list[0].date!);
}

function lastKickoff(matches: Match[], phase: Phase): Date | null {
  const list = phaseMatches(matches, phase);
  if (list.length === 0) return null;
  return new Date(list[list.length - 1].date!);
}

function previousKnockoutPhase(phase: Phase): Phase | "groups" {
  const idx = KO_PREDICTION_ORDER.indexOf(phase);
  if (idx <= 0) return "groups";
  return KO_PREDICTION_ORDER[idx - 1];
}

export interface PhaseEditWindow {
  phase: Phase;
  opens: Date | null;
  closes: Date | null;
}

export function getPhaseEditWindow(matches: Match[], phase: Phase): PhaseEditWindow {
  if (phase === "groups" || phase === "special") {
    return {
      phase,
      opens: null,
      closes: firstKickoff(matches, "round32"),
    };
  }

  const prev = previousKnockoutPhase(phase);
  const opens =
    prev === "groups" ? lastKickoff(matches, "groups") : lastKickoff(matches, prev);

  return {
    phase,
    opens,
    closes: firstKickoff(matches, phase),
  };
}

function isWithinWindow(now: Date, opens: Date | null, closes: Date | null): boolean {
  if (!closes) return opens ? now >= opens : true;
  if (opens && now < opens) return false;
  return now < closes;
}

/** Pot editar prediccions d'aquesta fase (horari + bloqueig admin) */
export function canEditPhasePredictions(
  phase: Phase,
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (phase === "groups" || phase === "special") {
    if (windows.groupsLocked) return false;
    const { closes } = getPhaseEditWindow(matches, phase);
    return closes ? now < closes : true;
  }

  if (!isKnockoutPhase(phase)) return false;
  if (!windows.knockoutOpen) return false;

  const { opens, closes } = getPhaseEditWindow(matches, phase);
  return isWithinWindow(now, opens, closes);
}

export function canEditMatchPrediction(
  match: Match,
  allMatches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (match.locked) return false;
  return canEditPhasePredictions(match.phase, allMatches, windows, now);
}

function formatDeadline(iso: Date | null): string {
  if (!iso) return "—";
  return formatMatchKickoff(iso.toISOString())?.full ?? iso.toLocaleString("ca-ES");
}

export function buildSubmissionDeadlineRows(matches: Match[]): { phase: string; limit: string }[] {
  const rows: { phase: string; limit: string }[] = [];

  const firstR32 = firstKickoff(matches, "round32");
  rows.push({
    phase: "Grups + prediccions especials (Mundial)",
    limit: firstR32
      ? `Abans del primer 32ens (${formatDeadline(firstR32)})`
      : "Abans de començar els 32ens de final",
  });

  for (const phase of KO_PREDICTION_ORDER) {
    const { opens, closes } = getPhaseEditWindow(matches, phase);
    const label = PHASE_DEADLINE_LABELS[phase];
    if (opens && closes) {
      rows.push({
        phase: `Marcadors + quadre — ${label}`,
        limit: `Des del ${formatDeadline(opens)} fins al ${formatDeadline(closes)}`,
      });
    } else if (closes) {
      rows.push({
        phase: `Marcadors + quadre — ${label}`,
        limit: `Abans del ${formatDeadline(closes)}`,
      });
    }
  }

  return rows;
}

export function getOpenKnockoutPhases(
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): Phase[] {
  return KO_PREDICTION_ORDER.filter((p) => canEditPhasePredictions(p, matches, windows, now));
}
