import { Match, Phase } from "@/types";
import { KNOCKOUT_ROUNDS } from "@/data/world-cup-2026";

export interface BracketRound {
  phase: Phase;
  name: string;
  matchIds: string[];
}

export function getBracketRounds(): BracketRound[] {
  return KNOCKOUT_ROUNDS;
}

/** Guanyador per al quadre — pròrroga/penals si n'hi ha; sinó 90 min o knockoutWinner */
export function getMatchWinner(match: Match): string | null {
  if (match.homeTeam === "TBD" || match.awayTeam === "TBD") {
    return null;
  }

  if (match.etHomeScore !== undefined && match.etAwayScore !== undefined) {
    if (match.etHomeScore > match.etAwayScore) return match.homeTeam;
    if (match.etAwayScore > match.etHomeScore) return match.awayTeam;
    if (match.knockoutWinner) return match.knockoutWinner;
    return null;
  }

  if (match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }

  if (match.homeScore > match.awayScore) return match.homeTeam;
  if (match.awayScore > match.homeScore) return match.awayTeam;
  if (match.homeScore === match.awayScore && match.knockoutWinner) {
    return match.knockoutWinner;
  }
  return null;
}

export function isMatchFinished(match: Match): boolean {
  return match.homeScore !== undefined && match.awayScore !== undefined;
}

export function hasExtraTimeResult(match: Match): boolean {
  return match.etHomeScore !== undefined && match.etAwayScore !== undefined;
}

export function getKnockoutMatches(matches: Match[]): Match[] {
  return matches.filter((m) => m.phase !== "groups" && m.phase !== "special");
}

export function matchesByIdMap(matches: Match[]): Record<string, Match> {
  return Object.fromEntries(matches.map((m) => [m.id, m]));
}
