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
  /** Guanyadors dels 32ens → classifiquen a 16ens */
  toRound16: Set<string>;
  /** Guanyadors dels 16ens → classifiquen a quarts */
  toQuarter: Set<string>;
  /** Guanyadors dels quarts → classifiquen a semis */
  toSemi: Set<string>;
  /** Guanyadors de semis → classifiquen a la final */
  toFinal: Set<string>;
}

export function emptyAdvancementSets(): AdvancementSets {
  return {
    toRound16: new Set(),
    toQuarter: new Set(),
    toSemi: new Set(),
    toFinal: new Set(),
  };
}

import { buildSimulatedKnockoutMatches, isRound32DrawComplete } from "@/lib/predicted-bracket";

export function deriveAdvancementSetsFromBracket(
  matches: Match[],
  bracketPicks: Record<string, string>
): AdvancementSets {
  const sim = buildSimulatedKnockoutMatches(matches, bracketPicks);

  function winnersOfPhase(phase: Phase): Set<string> {
    const teams = new Set<string>();
    for (const m of sim.filter((x) => x.phase === phase)) {
      const pick = bracketPicks[m.id];
      if (!pick || pick === "TBD") continue;
      if (m.homeTeam === pick || m.awayTeam === pick) {
        teams.add(pick);
      }
    }
    return teams;
  }

  return {
    toRound16: winnersOfPhase("round32"),
    toQuarter: winnersOfPhase("round16"),
    toSemi: winnersOfPhase("quarter"),
    toFinal: winnersOfPhase("semi"),
  };
}

export function deriveAdvancementSets(
  matches: Match[],
  predictions?: Record<string, ScorePrediction>,
  bracketPicks?: Record<string, string>
): AdvancementSets {
  if (bracketPicks && Object.keys(bracketPicks).length > 0) {
    return deriveAdvancementSetsFromBracket(matches, bracketPicks);
  }
  if (predictions && Object.keys(predictions).length > 0) {
    return {
      toRound16: teamsWinningPhase(matches, "round32", predictions),
      toQuarter: teamsWinningPhase(matches, "round16", predictions),
      toSemi: teamsWinningPhase(matches, "quarter", predictions),
      toFinal: teamsWinningPhase(matches, "semi", predictions),
    };
  }
  return emptyAdvancementSets();
}

/** Selecció revelació vàlida: fora del top 10 i arriba com a mínim a quarts */
export function surpriseTeamQualifies(team: string, matches: Match[]): boolean {
  if (!team) return false;

  // Senyal directe: l'equip apareix com a participant en un partit de quarts,
  // semis o final. Això indica que ha arribat (com a mínim) als quarts,
  // independentment de com s'hagi registrat el resultat dels vuitens.
  const reachedQuarterOrBeyond = matches.some(
    (m) =>
      (m.phase === "quarter" || m.phase === "semi" || m.phase === "final") &&
      (m.homeTeam === team || m.awayTeam === team)
  );
  if (reachedQuarterOrBeyond) return true;

  const actual = deriveAdvancementSets(matches);
  return actual.toQuarter.has(team) || actual.toSemi.has(team) || actual.toFinal.has(team);
}

export function disappointmentTeamValid(team: string, matches: Match[]): boolean {
  if (!team) return false;

  // Ja és a vuitens (round16): ha passat els Setzens, no és decepció.
  const inR16 = matches.some(
    (m) => m.phase === "round16" && (m.homeTeam === team || m.awayTeam === team)
  );
  if (inR16) return false;

  // Juga els Setzens (round32): decepció només si el partit s'ha jugat i no passa.
  const r32Match = matches.find(
    (m) => m.phase === "round32" && (m.homeTeam === team || m.awayTeam === team)
  );
  if (r32Match) {
    if (r32Match.homeScore === undefined) return false;
    return !teamsWinningPhase(matches, "round32").has(team);
  }

  // No és als Setzens. Només pot ser decepció (eliminada a la fase de grups)
  // quan el sorteig de Setzens ja està fet; abans, encara no se sap → esperar.
  if (!isRound32DrawComplete(matches)) return false;

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
  rules: { round16: number; quarter: number; semi: number }
): number {
  let pts = 0;
  for (const t of actual.toRound16) {
    if (predicted.toRound16.has(t)) pts += rules.round16;
  }
  for (const t of actual.toQuarter) {
    if (predicted.toQuarter.has(t)) pts += rules.quarter;
  }
  for (const t of actual.toSemi) {
    if (predicted.toSemi.has(t)) pts += rules.semi;
  }
  return pts;
}

/** Partits eliminatoris amb tria al quadre (inclou final i 3r lloc) */
export function countExpectedBracketPicks(matches: Match[]): number {
  return matches.filter(
    (m) =>
      m.phase === "round32" ||
      m.phase === "round16" ||
      m.phase === "quarter" ||
      m.phase === "semi" ||
      m.phase === "third" ||
      m.phase === "final"
  ).length;
}
