import { Group, Match } from "@/types";
import {
  buildRound32Pairings,
  groupPositionsFromStandings,
  isRound32BracketComplete,
  resolveThirdByLeader,
} from "@/lib/round32-bracket";
import { computeAllGroupStandings, GroupStanding } from "@/lib/standings";

export interface ApplyRound32Options {
  /** No modificar partits amb resultat real ja introduït (torneig admin) */
  skipPlayed?: boolean;
}

/**
 * Omple equips als partits de Setzens segons classificació de grups (torneig real).
 */
export function applyRound32FromStandings(
  matches: Match[],
  standings: GroupStanding[],
  options: ApplyRound32Options = {}
): boolean {
  const { skipPlayed = false } = options;
  const posiciones = groupPositionsFromStandings(standings);
  const pairings = buildRound32Pairings(posiciones, standings);
  let anyUpdate = false;

  for (const p of pairings) {
    const match = matches.find((m) => m.id === p.id);
    if (!match || match.phase !== "round32") continue;
    if (skipPlayed && match.homeScore !== undefined) continue;

    if (match.homeTeam !== p.homeTeam || match.awayTeam !== p.awayTeam) {
      match.homeTeam = p.homeTeam;
      match.awayTeam = p.awayTeam;
      anyUpdate = true;
    }
  }

  return anyUpdate;
}

/** Omple setzens al torneig real des de resultats de grups (admin). */
export function assignRound32FromGroupResults(
  groups: Group[],
  matches: Match[]
): boolean {
  const standings = computeAllGroupStandings(groups, matches);
  return applyRound32FromStandings(matches, standings, { skipPlayed: true });
}

export function isRound32FullyAssignable(
  groups: Group[],
  matches: Match[]
): boolean {
  const standings = computeAllGroupStandings(groups, matches);
  const posiciones = groupPositionsFromStandings(standings);
  if (resolveThirdByLeader(standings) === null) return false;
  const pairings = buildRound32Pairings(posiciones, standings);
  return isRound32BracketComplete(pairings);
}
