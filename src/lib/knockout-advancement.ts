import { Match, Phase, ScorePrediction } from "@/types";
import { getMatchWinner } from "@/lib/knockout";

function winnerFromPrediction(match: Match, pred: ScorePrediction): string | null {
  if (match.homeTeam === "TBD" || match.awayTeam === "TBD") return null;
  if (pred.home > pred.away) return match.homeTeam;
  if (pred.away > pred.home) return match.awayTeam;
  return null;
}

/** Guanyadors d'una fase eliminatòria (equips que passen a la següent ronda) */
export function teamsWinningPhase(
  matches: Match[],
  phase: Phase,
  predictions?: Record<string, ScorePrediction>
): Set<string> {
  const teams = new Set<string>();
  const phaseMatches = matches.filter((m) => m.phase === phase);

  for (const m of phaseMatches) {
    let winner: string | null = null;
    if (predictions?.[m.id]) {
      winner = winnerFromPrediction(m, predictions[m.id]);
    } else {
      winner = getMatchWinner(m);
    }
    if (winner) teams.add(winner);
  }

  return teams;
}

export interface AdvancementSets {
  /** Guanyadors dels 8ens → classifiquen a quarts */
  toQuarter: Set<string>;
  /** Guanyadors dels quarts → classifiquen a semis */
  toSemi: Set<string>;
  /** Guanyadors de semis → classifiquen a la final */
  toFinal: Set<string>;
}

export function deriveAdvancementSets(
  matches: Match[],
  predictions?: Record<string, ScorePrediction>
): AdvancementSets {
  return {
    toQuarter: teamsWinningPhase(matches, "round16", predictions),
    toSemi: teamsWinningPhase(matches, "quarter", predictions),
    toFinal: teamsWinningPhase(matches, "semi", predictions),
  };
}

/** Selecció revelació vàlida: fora del top 10 i arriba com a mínim a quarts */
export function surpriseTeamQualifies(team: string, matches: Match[]): boolean {
  if (!team) return false;
  const actual = deriveAdvancementSets(matches);
  return actual.toQuarter.has(team) || actual.toSemi.has(team) || actual.toFinal.has(team);
}

export function disappointmentTeamValid(team: string, matches: Match[]): boolean {
  if (!team) return false;

  const inR16 = matches.some(
    (m) => m.phase === "round16" && (m.homeTeam === team || m.awayTeam === team)
  );
  if (inR16) return false;

  const r32Match = matches.find(
    (m) => m.phase === "round32" && (m.homeTeam === team || m.awayTeam === team)
  );
  if (r32Match) {
    if (r32Match.homeScore === undefined) return false;
    return !teamsWinningPhase(matches, "round32").has(team);
  }

  return matches.some(
    (m) =>
      m.phase === "groups" &&
      (m.homeTeam === team || m.awayTeam === team) &&
      m.homeScore !== undefined
  );
}

export function scoreAdvancementPoints(
  predicted: AdvancementSets,
  actual: AdvancementSets,
  rules: { quarter: number; semi: number; final: number }
): number {
  let pts = 0;
  for (const t of actual.toQuarter) {
    if (predicted.toQuarter.has(t)) pts += rules.quarter;
  }
  for (const t of actual.toSemi) {
    if (predicted.toSemi.has(t)) pts += rules.semi;
  }
  for (const t of actual.toFinal) {
    if (predicted.toFinal.has(t)) pts += rules.final;
  }
  return pts;
}
