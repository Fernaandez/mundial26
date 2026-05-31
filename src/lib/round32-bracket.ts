/**
 * Assignació oficial Setzens (Round of 32).
 * Taula FIFA (495 combinacions) + algoritme greedy com a recurs.
 */

import thirdSlotsTable from "@/data/r32-third-slots.json";
import {
  computeBestThirdsRanking,
  GroupStanding,
  isGroupStandingComplete,
} from "@/lib/standings";

export type GroupPositions = Record<string, [string, string, string, string]>;

export type ThirdSlotKey = "A" | "B" | "D" | "E" | "G" | "I" | "K" | "L";

export interface Round32Pairing {
  matchNumber: number;
  id: string;
  homeTeam: string;
  awayTeam: string;
}

type CombinationRow = {
  qual: string;
  slots: Record<ThirdSlotKey, string>;
};

const COMBO_MAP = new Map<string, Record<ThirdSlotKey, string>>();
for (const row of thirdSlotsTable as CombinationRow[]) {
  COMBO_MAP.set(row.qual, row.slots);
}

/** Setzens — meitat esquerra i dreta del quadre FIFA (partits 1–8 / 9–16) */
export const R32_LEFT_IDS = Array.from({ length: 8 }, (_, i) => `r32-${i + 1}`);
export const R32_RIGHT_IDS = Array.from({ length: 8 }, (_, i) => `r32-${i + 9}`);

/** Líders que reben un 3r, en ordre estrict d'assignació (recurs greedy) */
const THIRD_HOSTS: { leaderGroup: string; options: string[] }[] = [
  { leaderGroup: "E", options: ["A", "B", "C", "D", "F"] },
  { leaderGroup: "I", options: ["C", "D", "F", "G", "H"] },
  { leaderGroup: "A", options: ["C", "E", "F", "H", "I"] },
  { leaderGroup: "L", options: ["E", "H", "I", "J", "K"] },
  { leaderGroup: "G", options: ["A", "E", "H", "I", "J"] },
  { leaderGroup: "D", options: ["B", "E", "F", "I", "J"] },
  { leaderGroup: "B", options: ["E", "F", "G", "I", "J"] },
  { leaderGroup: "K", options: ["D", "E", "I", "J", "L"] },
];

export function assignThirdPlaceGroupsGreedy(
  mejoresTerceros: string[]
): Record<ThirdSlotKey, string> | null {
  if (mejoresTerceros.length !== 8) return null;

  const assignedThirdGroups = new Set<string>();
  const leaderToThirdGroup = {} as Record<ThirdSlotKey, string>;

  for (const { leaderGroup, options } of THIRD_HOSTS) {
    let matched = false;
    for (const groupLetter of mejoresTerceros) {
      if (groupLetter === leaderGroup) continue;
      if (!options.includes(groupLetter)) continue;
      if (assignedThirdGroups.has(groupLetter)) continue;

      leaderToThirdGroup[leaderGroup as ThirdSlotKey] = groupLetter;
      assignedThirdGroups.add(groupLetter);
      matched = true;
      break;
    }
    if (!matched) return null;
  }

  return leaderToThirdGroup;
}

/** Mapa líder (1E, 1A, …) → grup del 3r que el visita */
export function resolveThirdByLeader(
  standings: GroupStanding[]
): Record<ThirdSlotKey, string> | null {
  if (!standings.every(isGroupStandingComplete)) return null;

  const ranking = computeBestThirdsRanking(standings, { requireComplete: true });
  const qualifying = ranking.filter((e) => e.qualifies);
  if (qualifying.length !== 8) return null;

  const qualKey = qualifying
    .map((e) => e.groupId)
    .sort()
    .join("");
  const fromTable = COMBO_MAP.get(qualKey);
  if (fromTable) return fromTable;

  const performanceOrder = qualifying.map((e) => e.groupId);
  return assignThirdPlaceGroupsGreedy(performanceOrder);
}

function teamAt(
  posiciones: GroupPositions,
  groupId: string,
  index: 0 | 1 | 2 | 3
): string {
  const row = posiciones[groupId];
  if (!row) return "TBD";
  return row[index] ?? "TBD";
}

function thirdTeam(
  posiciones: GroupPositions,
  thirdGroupLetter: string
): string {
  return teamAt(posiciones, thirdGroupLetter, 2);
}

/**
 * Construeix els 16 emparellaments de setzens.
 * posicionesGrupos: clau A–L → [1r, 2n, 3r, 4t] (codi equip)
 * mejoresTerceros: 8 grups el 3r del qual classifica, millor → pitjor
 */
export function buildRound32Pairings(
  posicionesGrupos: GroupPositions,
  standings: GroupStanding[] | null
): Round32Pairing[] {
  const thirdByLeader = standings ? resolveThirdByLeader(standings) : null;

  const thirdAway = (leader: ThirdSlotKey): string => {
    if (!thirdByLeader) return "TBD";
    const fromGroup = thirdByLeader[leader];
    if (!fromGroup) return "TBD";
    return thirdTeam(posicionesGrupos, fromGroup);
  };

  return [
    { matchNumber: 1, id: "r32-1", homeTeam: teamAt(posicionesGrupos, "A", 1), awayTeam: teamAt(posicionesGrupos, "B", 1) },
    { matchNumber: 2, id: "r32-2", homeTeam: teamAt(posicionesGrupos, "C", 0), awayTeam: teamAt(posicionesGrupos, "F", 1) },
    { matchNumber: 3, id: "r32-3", homeTeam: teamAt(posicionesGrupos, "E", 0), awayTeam: thirdAway("E") },
    { matchNumber: 4, id: "r32-4", homeTeam: teamAt(posicionesGrupos, "F", 0), awayTeam: teamAt(posicionesGrupos, "C", 1) },
    { matchNumber: 5, id: "r32-5", homeTeam: teamAt(posicionesGrupos, "E", 1), awayTeam: teamAt(posicionesGrupos, "I", 1) },
    { matchNumber: 6, id: "r32-6", homeTeam: teamAt(posicionesGrupos, "I", 0), awayTeam: thirdAway("I") },
    { matchNumber: 7, id: "r32-7", homeTeam: teamAt(posicionesGrupos, "A", 0), awayTeam: thirdAway("A") },
    { matchNumber: 8, id: "r32-8", homeTeam: teamAt(posicionesGrupos, "L", 0), awayTeam: thirdAway("L") },
    { matchNumber: 9, id: "r32-9", homeTeam: teamAt(posicionesGrupos, "G", 0), awayTeam: thirdAway("G") },
    { matchNumber: 10, id: "r32-10", homeTeam: teamAt(posicionesGrupos, "D", 0), awayTeam: thirdAway("D") },
    { matchNumber: 11, id: "r32-11", homeTeam: teamAt(posicionesGrupos, "H", 0), awayTeam: teamAt(posicionesGrupos, "J", 1) },
    { matchNumber: 12, id: "r32-12", homeTeam: teamAt(posicionesGrupos, "K", 1), awayTeam: teamAt(posicionesGrupos, "L", 1) },
    { matchNumber: 13, id: "r32-13", homeTeam: teamAt(posicionesGrupos, "B", 0), awayTeam: thirdAway("B") },
    { matchNumber: 14, id: "r32-14", homeTeam: teamAt(posicionesGrupos, "D", 1), awayTeam: teamAt(posicionesGrupos, "G", 1) },
    { matchNumber: 15, id: "r32-15", homeTeam: teamAt(posicionesGrupos, "J", 0), awayTeam: teamAt(posicionesGrupos, "H", 1) },
    { matchNumber: 16, id: "r32-16", homeTeam: teamAt(posicionesGrupos, "K", 0), awayTeam: thirdAway("K") },
  ];
}

export function groupPositionsFromStandings(standings: GroupStanding[]): GroupPositions {
  const result: GroupPositions = {};
  for (const s of standings) {
    if (!isGroupStandingComplete(s)) continue;
    const ordered = [...s.teams]
      .sort((a, b) => a.position - b.position)
      .map((t) => t.code);
    if (ordered.length === 4) {
      result[s.groupId] = ordered as [string, string, string, string];
    }
  }
  return result;
}

/** 8 grups el 3r del qual passa, ordenats millor → pitjor */
export function qualifyingThirdGroupsOrdered(
  standings: GroupStanding[]
): string[] | null {
  if (!standings.every(isGroupStandingComplete)) return null;
  const ranking = computeBestThirdsRanking(standings, { requireComplete: true });
  const qual = ranking.filter((e) => e.qualifies);
  if (qual.length !== 8) return null;
  return qual.map((e) => e.groupId);
}

export function isRound32BracketComplete(pairings: Round32Pairing[]): boolean {
  return pairings.every((p) => p.homeTeam !== "TBD" && p.awayTeam !== "TBD");
}
