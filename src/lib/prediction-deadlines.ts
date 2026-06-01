import { Match, Phase } from "@/types";
import { compareMatchesByKickoff, formatMatchKickoff } from "@/lib/match-dates";
import { PHASE_LABELS } from "@/data/phase-labels";
import { PredictionWindows, isKnockoutPhase, isKnockoutPhaseOpen } from "@/lib/phases";
import { isRound32DrawComplete } from "@/lib/predicted-bracket";

const KO_MARCADORS_ORDER: Phase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

export type PredictionWindowTarget = "groups" | Phase;

export interface PredictionWindow {
  opens: Date | null;
  closes: Date | null;
}

export type CountdownStatus = "open" | "upcoming" | "closed";

export interface PredictionCountdown {
  status: CountdownStatus;
  headline: string;
  detail: string;
  msRemaining: number;
  opens: Date | null;
  closes: Date | null;
}

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

function firstGroupKickoff(matches: Match[]): Date | null {
  return firstKickoff(matches, "groups");
}

function lastGroupKickoff(matches: Match[]): Date | null {
  return lastKickoff(matches, "groups");
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0 min";
  const totalMin = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMin / (24 * 60));
  const hours = Math.floor((totalMin % (24 * 60)) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days} ${days === 1 ? "dia" : "dies"}${hours > 0 ? ` ${hours} h` : ""}`;
  if (hours > 0) return `${hours} h ${mins} min`;
  return `${mins} min`;
}

function deadlinesApply(windows: PredictionWindows): boolean {
  return !windows.testMode;
}

function isInWindow(window: PredictionWindow, now: Date): boolean {
  const { opens, closes } = window;
  if (!closes) return false;
  if (!opens) return now < closes;
  return now >= opens && now < closes;
}

/**
 * Finestres d'entrega (ESPECIFICACIO §4):
 * obertura = kickoff darrer partit fase anterior; tancament = kickoff primer partit ronda actual.
 */
export function getPredictionWindow(
  matches: Match[],
  target: PredictionWindowTarget
): PredictionWindow {
  if (target === "groups") {
    return {
      opens: null,
      closes: firstKickoff(matches, "groups"),
    };
  }

  if (target === "round32") {
    return {
      opens: lastKickoff(matches, "groups"),
      closes: firstKickoff(matches, "round32"),
    };
  }

  if (target === "final") {
    return {
      opens: lastKickoff(matches, "semi"),
      closes: firstKickoff(matches, "final"),
    };
  }

  const prev = previousKnockoutPhase(target);
  const lastPrev =
    prev === "groups" ? lastKickoff(matches, "groups") : lastKickoff(matches, prev);
  return {
    opens: lastPrev,
    closes: firstKickoff(matches, target),
  };
}

export function getPredictionCountdown(
  matches: Match[],
  target: PredictionWindowTarget,
  label: string,
  now: Date = new Date()
): PredictionCountdown | null {
  const window = getPredictionWindow(matches, target);
  const { opens, closes } = window;

  if (!closes) {
    return {
      status: "closed",
      headline: `${label} — calendari pendent`,
      detail: "Encara no hi ha dates de partits per calcular la finestra.",
      msRemaining: 0,
      opens,
      closes,
    };
  }

  if (target === "groups" && !opens) {
    if (now >= closes) {
      return {
        status: "closed",
        headline: `${label} — finestra tancada`,
        detail: `Es va tancar el ${formatDeadline(closes)} (kickoff del primer partit de grups).`,
        msRemaining: 0,
        opens,
        closes,
      };
    }
    const ms = closes.getTime() - now.getTime();
    return {
      status: "open",
      headline: `${label} — obert fins al ${formatDeadline(closes)}`,
      detail: `Queden ${formatCountdown(ms)}. Tancament al kickoff del primer partit de fase de grups (abans que comenci el Mundial).`,
      msRemaining: ms,
      opens,
      closes,
    };
  }

  if (!opens || !closes) {
    return {
      status: "closed",
      headline: `${label} — calendari pendent`,
      detail: "Encara no hi ha dates de partits per calcular la finestra.",
      msRemaining: 0,
      opens,
      closes,
    };
  }

  if (now < opens) {
    const ms = opens.getTime() - now.getTime();
    return {
      status: "upcoming",
      headline: `${label} — s'obrirà en ${formatCountdown(ms)}`,
      detail: `Obertura: ${formatDeadline(opens)} (kickoff del darrer partit de la fase anterior). Tancament: ${formatDeadline(closes)}.`,
      msRemaining: ms,
      opens,
      closes,
    };
  }

  if (now >= closes) {
    return {
      status: "closed",
      headline: `${label} — finestra tancada`,
      detail: `Es va tancar el ${formatDeadline(closes)} (kickoff del primer partit d'aquesta ronda).`,
      msRemaining: 0,
      opens,
      closes,
    };
  }

  const ms = closes.getTime() - now.getTime();
  return {
    status: "open",
    headline: `${label} — obert fins al ${formatDeadline(closes)}`,
    detail: `Queden ${formatCountdown(ms)}. Del kickoff del darrer partit anterior (${formatDeadline(opens)}) al kickoff del primer d'aquesta ronda.`,
    msRemaining: ms,
    opens,
    closes,
  };
}

/** Grups + Mundial: obert des d'ara fins al kickoff del primer partit de grups (§4) */
export function canEditGroupsOrSpecial(
  windows: PredictionWindows,
  matches: Match[],
  now: Date = new Date()
): boolean {
  if (windows.groupsLocked) return false;
  if (!deadlinesApply(windows)) return true;
  return isInWindow(getPredictionWindow(matches, "groups"), now);
}

/** Quadre simulat — finestra Setzens: darrer grup → primer Setzens (§4) */
export function canEditFullBracket(
  windows: PredictionWindows,
  matches: Match[],
  now: Date = new Date()
): boolean {
  if (!isKnockoutPhaseOpen("round32", windows)) return false;
  if (!isRound32DrawComplete(matches)) return false;
  if (!deadlinesApply(windows)) return true;
  return isInWindow(getPredictionWindow(matches, "round32"), now);
}

/** Marcadors per fase eliminatòria */
export function canEditMarcadorsPhase(
  phase: Phase,
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): boolean {
  if (phase === "groups") return canEditGroupsOrSpecial(windows, matches, now);
  if (phase === "special") return canEditGroupsOrSpecial(windows, matches, now);
  if (!isKnockoutPhase(phase)) return false;
  if (!isKnockoutPhaseOpen(phase, windows)) return false;

  if (!deadlinesApply(windows)) return true;

  return isInWindow(getPredictionWindow(matches, phase), now);
}

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
  return canEditFullBracket(windows, matches, now);
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

  const groupsWin = getPredictionWindow(matches, "groups");
  if (groupsWin.closes) {
    rows.push({
      phase: "Grups + prediccions especials (Mundial)",
      limit: `Fins al ${formatDeadline(groupsWin.closes)} (kickoff del primer partit de grups)`,
    });
  }

  const setzensWin = getPredictionWindow(matches, "round32");
  if (setzensWin.opens && setzensWin.closes) {
    rows.push({
      phase: "Setzens — Marcadors + Quadre",
      limit: `Del ${formatDeadline(setzensWin.opens)} (darrer partit de grups) al ${formatDeadline(setzensWin.closes)} (primer Setzens)`,
    });
  }

  for (const phase of KO_MARCADORS_ORDER) {
    if (phase === "round32") continue;
    const win = getPredictionWindow(matches, phase);
    if (win.opens && win.closes) {
      const prevPhase = phase === "final" ? "semi" : previousKnockoutPhase(phase);
      const prevLabel =
        prevPhase === "groups" ? "grups" : PHASE_LABELS[prevPhase as Phase];
      rows.push({
        phase: `Marcadors — ${PHASE_LABELS[phase]}`,
        limit: `Del ${formatDeadline(win.opens)} (darrer ${prevLabel}) al ${formatDeadline(win.closes)} (primer ${PHASE_LABELS[phase]})`,
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
  matches: Match[],
  windows: PredictionWindows,
  now: Date = new Date()
): Phase[] {
  if (!canEditFullBracket(windows, matches, now)) return [];
  return KO_MARCADORS_ORDER;
}
