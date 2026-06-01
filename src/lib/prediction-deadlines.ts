import { Match, Phase } from "@/types";
import { compareMatchesByKickoff, formatMatchKickoff } from "@/lib/match-dates";
import { PHASE_LABELS } from "@/data/phase-labels";
import { PredictionWindows, isKnockoutPhase, isKnockoutPhaseOpen } from "@/lib/phases";
import { isRound32DrawComplete } from "@/lib/predicted-bracket";

/** Durada estimada d'un partit (90 min + descans + marge) per obrir la finestra següent */
export const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

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

function afterMatchEnd(kickoff: Date): Date {
  return new Date(kickoff.getTime() + MATCH_DURATION_MS);
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

/** Finestra horària de predicció per fase (calendari real + 2 h després del darrer partit anterior) */
export function getPredictionWindow(
  matches: Match[],
  target: PredictionWindowTarget
): PredictionWindow {
  if (target === "groups") {
    // Grups + Mundial: obert des d'ara fins al kickoff del primer 1/16 (Setzens)
    return {
      opens: null,
      closes: firstKickoff(matches, "round32"),
    };
  }

  if (target === "round32") {
    const lastGroup = lastKickoff(matches, "groups");
    return {
      opens: lastGroup ? afterMatchEnd(lastGroup) : null,
      closes: firstKickoff(matches, "round32"),
    };
  }

  const prev = previousKnockoutPhase(target);
  const lastPrev = lastKickoff(matches, prev);
  return {
    opens: lastPrev ? afterMatchEnd(lastPrev) : null,
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
    const firstGroup = firstGroupKickoff(matches);
    const lastGroup = lastGroupKickoff(matches);
    const calendarNote = firstGroup
      ? `Primer partit de grups: ${formatDeadline(firstGroup)}. Darrer: ${lastGroup ? formatDeadline(lastGroup) : "—"}.`
      : "";

    if (now >= closes) {
      return {
        status: "closed",
        headline: `${label} — finestra tancada`,
        detail: `Es va tancar el ${formatDeadline(closes)} (kickoff del primer Setzens / 1/16). ${calendarNote}`,
        msRemaining: 0,
        opens,
        closes,
      };
    }
    const ms = closes.getTime() - now.getTime();
    return {
      status: "open",
      headline: `${label} — obert fins al ${formatDeadline(closes)}`,
      detail: `Queden ${formatCountdown(ms)} per omplir grups i Mundial. ${calendarNote} Es tanca abans del primer Setzens (1/16), no al primer partit de grups.`,
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
    const openDetail =
      target === "groups"
        ? `Obertura: ${formatDeadline(opens)} (kickoff del primer partit de grups).`
        : `Obertura: ${formatDeadline(opens)} (2 h després del darrer partit de la fase anterior).`;
    return {
      status: "upcoming",
      headline: `${label} — s'obrirà en ${formatCountdown(ms)}`,
      detail: openDetail,
      msRemaining: ms,
      opens,
      closes,
    };
  }

  if (now >= closes) {
    const closeDetail =
      target === "groups"
        ? `Es va tancar el ${formatDeadline(closes)} (kickoff del primer partit de setzens / 1/16).`
        : `Es va tancar el ${formatDeadline(closes)} (kickoff del primer partit d'aquesta ronda).`;
    return {
      status: "closed",
      headline: `${label} — finestra tancada`,
      detail: closeDetail,
      msRemaining: 0,
      opens,
      closes,
    };
  }

  const ms = closes.getTime() - now.getTime();
  const closeDetail =
    target === "groups"
      ? `Tancament: ${formatDeadline(closes)} (kickoff del primer Setzens / 1/16).`
      : `Tancament: ${formatDeadline(closes)} (kickoff del primer partit d'aquesta ronda). Queden ${formatCountdown(ms)}.`;
  return {
    status: "open",
    headline: `${label} — obert fins al ${formatDeadline(closes)}`,
    detail: closeDetail,
    msRemaining: ms,
    opens,
    closes,
  };
}

/** Grups + Mundial: obert des d'ara fins al kickoff del primer 1/16 */
export function canEditGroupsOrSpecial(
  windows: PredictionWindows,
  matches: Match[],
  now: Date = new Date()
): boolean {
  if (windows.groupsLocked) return false;
  if (!deadlinesApply(windows)) return true;
  return isInWindow(getPredictionWindow(matches, "groups"), now);
}

/** Quadre simulat — 16/16 equips a 1/16 + finestra (darrer grup +2 h → primer 1/16) */
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

  const firstGroup = firstGroupKickoff(matches);
  const lastGroup = lastGroupKickoff(matches);
  const groupsWin = getPredictionWindow(matches, "groups");
  if (groupsWin.closes) {
    rows.push({
      phase: "Grups + prediccions especials (Mundial)",
      limit: [
        "Obert des d'ara",
        firstGroup ? `Primer partit de grups: ${formatDeadline(firstGroup)}` : null,
        lastGroup ? `Darrer partit de grups: ${formatDeadline(lastGroup)}` : null,
        `Tancament: ${formatDeadline(groupsWin.closes)} (kickoff primer Setzens / 1/16)`,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  const setzensWin = getPredictionWindow(matches, "round32");
  if (setzensWin.opens && setzensWin.closes) {
    rows.push({
      phase: "Quadre (simulació eliminatòria)",
      limit: `Del ${formatDeadline(setzensWin.opens)} al ${formatDeadline(setzensWin.closes)} (2 h després del darrer partit de grups → primer 1/16)`,
    });
    rows.push({
      phase: "Marcadors — Setzens de final (1/16)",
      limit: `Del ${formatDeadline(setzensWin.opens)} al ${formatDeadline(setzensWin.closes)}`,
    });
  }

  for (const phase of KO_MARCADORS_ORDER) {
    if (phase === "round32") continue;
    const win = getPredictionWindow(matches, phase);
    if (win.opens && win.closes) {
      rows.push({
        phase: `Marcadors — ${PHASE_LABELS[phase]}`,
        limit: `Del ${formatDeadline(win.opens)} al ${formatDeadline(win.closes)} (2 h després de la fase anterior → kickoff d'aquesta ronda)`,
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
