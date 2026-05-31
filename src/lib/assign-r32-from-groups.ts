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

const ALL_GROUP_IDS = "ABCDEFGHIJKL".split("");

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

/**
 * Omple equips als partits de Setzens segons resultats reals de grups.
 * Només afecta dades del torneig (admin) — no prediccions dels jugadors.
 */
export function assignRound32FromGroupResults(
  groups: Group[],
  matches: Match[]
): boolean {
  const standings = computeAllGroupStandings(groups, matches);
  const standingsByGroup = new Map(standings.map((s) => [s.groupId, s]));
  const thirdSlots = resolveThirdSlots(standings);

  let anyUpdate = false;

  for (const fixture of R32_FIXTURES) {
    const match = matches.find((m) => m.id === fixture.id);
    if (!match || match.phase !== "round32") continue;
    if (match.homeScore !== undefined) continue;

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

/** Tots els grups acabats i 8 tercers resolts */
export function isRound32FullyAssignable(
  groups: Group[],
  matches: Match[]
): boolean {
  const standings = computeAllGroupStandings(groups, matches);
  return resolveThirdSlots(standings) !== null;
}
