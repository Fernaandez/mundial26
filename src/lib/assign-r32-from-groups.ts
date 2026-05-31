import { Group, Match } from "@/types";
import { R32_FIXTURES, ThirdSlotKey } from "@/data/r32-fixtures";
import thirdCombinations from "@/data/r32-third-combinations.json";
import {
  computeAllGroupStandings,
  computeBestThirdsRanking,
  GroupStanding,
  isGroupStandingComplete,
} from "@/lib/standings";

type CombinationRow = {
  qual: string;
  slots: Record<ThirdSlotKey, string>;
};

const COMBO_MAP = new Map<string, Record<ThirdSlotKey, string>>();
for (const row of thirdCombinations as CombinationRow[]) {
  COMBO_MAP.set(row.qual, row.slots);
}

const ALL_GROUP_IDS = "ABCDEFGHIJKL".split("");

function parseFixedSlot(slot: string): { position: number; groupId: string } | null {
  const m = slot.match(/^([12])([A-L])$/);
  if (!m) return null;
  return { position: parseInt(m[1], 10), groupId: m[2] };
}

function teamAtPosition(
  standingsByGroup: Map<string, GroupStanding>,
  groupId: string,
  position: number
): string | null {
  const standing = standingsByGroup.get(groupId);
  if (!standing || !isGroupStandingComplete(standing)) return null;
  const team = standing.teams.find((t) => t.position === position);
  return team?.code ?? null;
}

function thirdTeamCode(
  standingsByGroup: Map<string, GroupStanding>,
  groupId: string
): string | null {
  const standing = standingsByGroup.get(groupId);
  if (!standing || !isGroupStandingComplete(standing)) return null;
  const team = standing.teams.find((t) => t.position === 3);
  return team?.code ?? null;
}

function resolveThirdSlots(
  standings: GroupStanding[]
): Record<ThirdSlotKey, string> | null {
  const allComplete = standings.every(isGroupStandingComplete);
  if (!allComplete) return null;

  const bestThirds = computeBestThirdsRanking(standings, { requireComplete: true });
  const qualifying = new Set(
    bestThirds.filter((e) => e.qualifies).map((e) => e.groupId)
  );
  if (qualifying.size !== 8) return null;

  // Annex C FIFA: clau = 4 grups el 3r del qual NO classifica
  const qualKey = ALL_GROUP_IDS.filter((g) => !qualifying.has(g))
    .sort()
    .join("");
  const slots = COMBO_MAP.get(qualKey);
  if (!slots) return null;

  const standingsByGroup = new Map(standings.map((s) => [s.groupId, s]));
  const result = {} as Record<ThirdSlotKey, string>;
  for (const key of Object.keys(slots) as ThirdSlotKey[]) {
    const groupId = slots[key];
    const code = thirdTeamCode(standingsByGroup, groupId);
    if (!code) return null;
    result[key] = code;
  }
  return result;
}

function resolveFixedSlot(
  slot: string,
  standingsByGroup: Map<string, GroupStanding>
): string | null {
  const parsed = parseFixedSlot(slot);
  if (!parsed) return null;
  return teamAtPosition(standingsByGroup, parsed.groupId, parsed.position);
}

export interface ApplyRound32Options {
  /** No modificar partits amb resultat real ja introduït (torneig admin) */
  skipPlayed?: boolean;
}

/**
 * Omple equips als partits de Setzens segons classificació de grups.
 * Funciona amb resultats reals o prediccions simulades per usuari.
 */
export function applyRound32FromStandings(
  matches: Match[],
  standings: GroupStanding[],
  options: ApplyRound32Options = {}
): boolean {
  const { skipPlayed = false } = options;
  const standingsByGroup = new Map(standings.map((s) => [s.groupId, s]));
  const thirdSlots = resolveThirdSlots(standings);
  let anyUpdate = false;

  for (const fixture of R32_FIXTURES) {
    const match = matches.find((m) => m.id === fixture.id);
    if (!match || match.phase !== "round32") continue;
    if (skipPlayed && match.homeScore !== undefined) continue;

    const home = resolveFixedSlot(fixture.home, standingsByGroup);
    let away: string | null = null;

    if (fixture.away) {
      away = resolveFixedSlot(fixture.away, standingsByGroup);
    } else if (fixture.awayThirdSlot && thirdSlots) {
      away = thirdSlots[fixture.awayThirdSlot] ?? null;
    }

    const newHome = home ?? "TBD";
    const newAway = away ?? "TBD";

    if (match.homeTeam !== newHome || match.awayTeam !== newAway) {
      match.homeTeam = newHome;
      match.awayTeam = newAway;
      anyUpdate = true;
    }
  }

  return anyUpdate;
}

/** Clona partits i omple setzens des d'una classificació */
export function buildKnockoutMatchesFromStandings(
  matches: Match[],
  standings: GroupStanding[],
  options?: ApplyRound32Options
): Match[] {
  const clone = matches.map((m) => ({ ...m }));
  applyRound32FromStandings(clone, standings, options);
  return clone;
}

/**
 * Omple equips als partits de Setzens segons resultats reals de grups (torneig admin).
 */
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
  const allComplete = standings.every(isGroupStandingComplete);
  if (!allComplete) return false;
  const bestThirds = computeBestThirdsRanking(standings, { requireComplete: true });
  const qualifying = new Set(
    bestThirds.filter((e) => e.qualifies).map((e) => e.groupId)
  );
  const qualKey = ALL_GROUP_IDS.filter((g) => !qualifying.has(g)).sort().join("");
  return COMBO_MAP.has(qualKey);
}
