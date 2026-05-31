import { Match, Phase } from "@/types";
import { compareMatchesByKickoff, formatMatchKickoff } from "@/lib/match-dates";
import { PHASE_LABELS } from "@/data/phase-labels";
import { FIXED_DEADLINES } from "@/data/rules-config";
import { PredictionWindows, isKnockoutPhase } from "@/lib/phases";

const KO_MARCADORS_ORDER: Phase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

function phaseMatches(matches: Match[], phase: Phase): Match[] {
  return matches.filter((m) => m.phase === phase && m.date).sort(compareMatchesByKickoff);
}

function firstKickoff(matches: Match[], phase: Phase): Date | null {
  const list = phaseMatches(matches, phase);
  return list.length ? new Date(list[0].date!) : null;
}

function lastKickoff(matches: Match[], phase: Phase): Date | null {
  const list = phaseMatches(matches, phase);
  return list.length ? new Date(list[list.length - 1].date!) : null;
}

function previousKnockoutPhase(phase: Phase): Phase | "groups" {
  const idx = KO_MARCADORS_ORDER.indexOf(phase);
  if (idx <= 0) return "groups";
  return KO_MARCADORS_ORDER[idx - 1];
}

function formatDeadline(d: Date): string {
  return formatMatchKickoff(d.toISOString())?.full ?? d.toLocaleString("ca-ES");
}

function isSetzensWindow(now: Date): boolean {
  return now >= FIXED_DEADLINES.setzensOpen && now <= FIXED_DEADLINES.setzensClose;
}

function deadlinesApply(windows: PredictionWindows): boolean {
  return !windows.testMode;
}

/** Grups + prediccions especials (Mundial) */
export function canEditGroupsOrSpecial(
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (windows.groupsLocked) return false;
  if (!deadlinesApply(windows)) return true;
  return now <= FIXED_DEADLINES.groupsSpecialClose;
}

/** Quadre sencer — només finestra Setzens (28 juny 04:00–20:59) */
export function canEditFullBracket(
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (!windows.knockoutOpen) return false;
  if (!deadlinesApply(windows)) return true;
  return isSetzensWindow(now);
}

/** Marcadors per fase eliminatòria */
export function canEditMarcadorsPhase(
  phase: Phase,
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (phase === "groups") return canEditGroupsOrSpecial(windows, now);
  if (phase === "special") return canEditGroupsOrSpecial(windows, now);
  if (!isKnockoutPhase(phase)) return false;
  if (!windows.knockoutOpen) return false;

  if (!deadlinesApply(windows)) return true;

  if (phase === "round32") {
    return isSetzensWindow(now);
  }

  const prev = previousKnockoutPhase(phase);
  const opens =
    prev === "groups" ? lastKickoff(matches, "groups") : lastKickoff(matches, prev);
  const closes = firstKickoff(matches, phase);
  if (!opens || !closes) return false;
  return now >= opens && now < closes;
}

/** Compat: predicció de partit */
export function canEditPhasePredictions(
  phase: Phase,
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  return canEditMarcadorsPhase(phase, matches, windows, now);
}

export function canEditBracketPhase(
  phase: Phase,
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (!isKnockoutPhase(phase)) return false;
  return canEditFullBracket(windows, now);
}

export function canEditMatchPrediction(
  match: Match,
  allMatches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (match.locked) return false;
  return canEditMarcadorsPhase(match.phase, allMatches, windows, now);
}

export function buildSubmissionDeadlineRows(matches: Match[]): { phase: string; limit: string }[] {
  const rows: { phase: string; limit: string }[] = [];

  rows.push({
    phase: "Grups + prediccions especials (Mundial)",
    limit: `Abans del ${formatDeadline(FIXED_DEADLINES.groupsSpecialClose)}`,
  });

  rows.push({
    phase: "Marcadors Setzens + Quadre sencer",
    limit: `Del ${formatDeadline(FIXED_DEADLINES.setzensOpen)} al ${formatDeadline(FIXED_DEADLINES.setzensClose)}`,
  });

  for (const phase of KO_MARCADORS_ORDER) {
    if (phase === "round32") continue;
    const prev = previousKnockoutPhase(phase);
    const opens =
      prev === "groups" ? lastKickoff(matches, "groups") : lastKickoff(matches, prev);
    const closes = firstKickoff(matches, phase);
    if (opens && closes) {
      rows.push({
        phase: `Marcadors — ${PHASE_LABELS[phase]}`,
        limit: `Des del ${formatDeadline(opens)} fins al ${formatDeadline(closes)}`,
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
  return KO_MARCADORS_ORDER.filter((p) => canEditMarcadorsPhase(p, matches, windows, now));
}

export function getOpenBracketPhases(
  windows: PredictionWindows,
  now: Date = new Date()
): Phase[] {
  if (!canEditFullBracket(windows, now)) return [];
  return KO_MARCADORS_ORDER;
}
