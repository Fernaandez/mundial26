/**
 * Quadre simulat del participant: part de dels 1/16 reals i propaga guanyadors (bracketPicks).
 */

import { Match, Phase } from "@/types";
import {
  getBracketAdvanceSlot,
  getBracketLoserToThirdSlot,
  KO_PHASE_ORDER,
} from "@/lib/bracket-tree";

export function isRound32DrawComplete(matches: Match[]): boolean {
  const r32 = matches.filter((m) => m.phase === "round32");
  if (r32.length !== 16) return false;
  return r32.every((m) => m.homeTeam !== "TBD" && m.awayTeam !== "TBD");
}

function knockoutMatches(matches: Match[]): Match[] {
  return matches.filter((m) => m.phase !== "groups" && m.phase !== "special");
}

/** Construeix l'eliminatòria simulada a partir dels 1/16 reals + tries del participant */
export function buildSimulatedKnockoutMatches(
  realMatches: Match[],
  bracketPicks: Record<string, string>
): Match[] {
  const ko = knockoutMatches(realMatches);
  const byId: Record<string, Match> = {};

  for (const m of ko) {
    const real = realMatches.find((x) => x.id === m.id)!;
    if (m.phase === "round32") {
      byId[m.id] = {
        ...m,
        homeTeam: real.homeTeam,
        awayTeam: real.awayTeam,
        homeScore: undefined,
        awayScore: undefined,
        etHomeScore: undefined,
        etAwayScore: undefined,
        knockoutWinner: undefined,
      };
    } else {
      byId[m.id] = {
        ...m,
        homeTeam: "TBD",
        awayTeam: "TBD",
        homeScore: undefined,
        awayScore: undefined,
        etHomeScore: undefined,
        etAwayScore: undefined,
        knockoutWinner: undefined,
      };
    }
  }

  for (const phase of KO_PHASE_ORDER) {
    const phaseIds = ko.filter((m) => m.phase === phase).map((m) => m.id);
    for (const id of phaseIds) {
      const sim = byId[id];
      const pick = bracketPicks[id];
      if (!pick || pick === "TBD") continue;
      if (sim.homeTeam !== pick && sim.awayTeam !== pick) continue;

      const advance = getBracketAdvanceSlot(id);
      if (advance && byId[advance.nextId]) {
        if (advance.slot === "home") byId[advance.nextId].homeTeam = pick;
        else byId[advance.nextId].awayTeam = pick;
      }

      const loserSlot = getBracketLoserToThirdSlot(id);
      if (loserSlot && byId[loserSlot.nextId] && sim.homeTeam !== "TBD" && sim.awayTeam !== "TBD") {
        const loser = sim.homeTeam === pick ? sim.awayTeam : sim.homeTeam;
        if (loserSlot.slot === "home") byId[loserSlot.nextId].homeTeam = loser;
        else byId[loserSlot.nextId].awayTeam = loser;
      }
    }
  }

  return ko.map((m) => byId[m.id]);
}

/** @deprecated usa buildSimulatedKnockoutMatches */
export function getRealKnockoutMatchesForBracket(matches: Match[]): Match[] {
  return knockoutMatches(matches).map((m) => ({ ...m }));
}

export function bothTeamsReady(match: Match): boolean {
  return match.homeTeam !== "TBD" && match.awayTeam !== "TBD";
}

export function countFilledBracketPicks(
  simulated: Match[],
  bracketPicks: Record<string, string>
): number {
  return simulated.filter((m) => {
    const pick = bracketPicks[m.id];
    if (!pick) return false;
    return m.homeTeam === pick || m.awayTeam === pick;
  }).length;
}

export function expectedSimulatedBracketPicks(simulated: Match[]): number {
  return simulated.filter(bothTeamsReady).length;
}
