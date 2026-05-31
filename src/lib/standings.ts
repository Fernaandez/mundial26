import { Group, Match } from "@/types";
import { compareFifaRanking } from "@/data/fifa-rankings";
import { fairPlayPointsForTeamInMatch } from "@/lib/fair-play";

export interface TeamStanding {
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  /** Punts fair play acumulats (menys = millor conducta) */
  fairPlayPoints: number;
  position: number;
}

export interface GroupStanding {
  groupId: string;
  groupName: string;
  teams: TeamStanding[];
  playedMatches: number;
  totalMatches: number;
}

function initStanding(code: string): Omit<TeamStanding, "position"> {
  return {
    code,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    fairPlayPoints: 0,
  };
}

/** Classificació dins del grup (punts, DG, GF, codi) */
function compareTeamsInGroup(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.code.localeCompare(b.code);
}

/**
 * Desempat dels 8 millors 3rs (FIFA):
 * punts → DG → GF → victòries → fair play (menys millor) → rànquing FIFA
 */
export function compareBestThirdTeams(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  if (b.won !== a.won) return b.won - a.won;
  if (a.fairPlayPoints !== b.fairPlayPoints) return a.fairPlayPoints - b.fairPlayPoints;
  return compareFifaRanking(a.code, b.code);
}

export function isGroupStandingComplete(standing: GroupStanding): boolean {
  return standing.totalMatches > 0 && standing.playedMatches === standing.totalMatches;
}

export interface BestThirdEntry {
  rank: number;
  groupId: string;
  groupName: string;
  team: TeamStanding;
  qualifies: boolean;
  groupComplete: boolean;
}

/** Rànquing dels 3rs de cada grup (els 8 primers passen d'eliminatoria) */
export function computeBestThirdsRanking(
  standings: GroupStanding[],
  options: { requireComplete?: boolean } = {}
): BestThirdEntry[] {
  const { requireComplete = false } = options;
  const entries: Omit<BestThirdEntry, "rank" | "qualifies">[] = [];

  for (const standing of standings) {
    const complete = isGroupStandingComplete(standing);
    if (requireComplete && !complete) continue;

    const third = standing.teams.find((t) => t.position === 3);
    if (!third) continue;
    if (!requireComplete && standing.playedMatches === 0) continue;

    entries.push({
      groupId: standing.groupId,
      groupName: standing.groupName,
      team: third,
      groupComplete: complete,
    });
  }

  entries.sort((a, b) => compareBestThirdTeams(a.team, b.team));

  return entries.map((entry, i) => ({
    ...entry,
    rank: i + 1,
    qualifies: i < 8,
  }));
}

export function computeThirdQualifierGroupsFromStandings(
  standings: GroupStanding[],
  requireComplete = true
): Set<string> {
  return new Set(
    computeBestThirdsRanking(standings, { requireComplete })
      .filter((e) => e.qualifies)
      .map((e) => e.groupId)
  );
}

/** Els 8 millors 3rs classificats */
export function computeThirdQualifierGroups(
  groups: Group[],
  matches: Match[],
  predictions: Record<string, { home: number; away: number }>
): Set<string> {
  const standings = groups.map((g) =>
    computeGroupStandingFromPredictions(g, matches, predictions)
  );
  return computeThirdQualifierGroupsFromStandings(standings, false);
}

export function computeGroupStanding(group: Group, matches: Match[]): GroupStanding {
  const groupMatches = matches.filter(
    (m) => m.groupId === group.id && m.homeScore !== undefined && m.awayScore !== undefined
  );
  const allGroupMatches = matches.filter((m) => m.groupId === group.id);

  const stats = new Map<string, Omit<TeamStanding, "position">>();
  for (const t of group.teams) {
    stats.set(t.code, initStanding(t.code));
  }

  for (const m of groupMatches) {
    const home = stats.get(m.homeTeam);
    const away = stats.get(m.awayTeam);
    if (!home || !away) continue;

    const hs = m.homeScore!;
    const as = m.awayScore!;

    home.played++;
    away.played++;
    home.gf += hs;
    home.ga += as;
    away.gf += as;
    away.ga += hs;
    home.fairPlayPoints += fairPlayPointsForTeamInMatch(m, m.homeTeam);
    away.fairPlayPoints += fairPlayPointsForTeamInMatch(m, m.awayTeam);

    if (hs > as) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hs < as) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  }

  const teams: TeamStanding[] = Array.from(stats.values())
    .map((s) => ({ ...s, gd: s.gf - s.ga, position: 0 }))
    .sort(compareTeamsInGroup)
    .map((s, i) => ({ ...s, position: i + 1 }));

  return {
    groupId: group.id,
    groupName: group.name,
    teams,
    playedMatches: groupMatches.length,
    totalMatches: allGroupMatches.length,
  };
}

export function computeAllGroupStandings(groups: Group[], matches: Match[]): GroupStanding[] {
  return groups.map((g) => computeGroupStanding(g, matches));
}

/** Classificació prevista a partir dels marcadors predits (fase de grups) */
export function computeGroupStandingFromPredictions(
  group: Group,
  matches: Match[],
  predictions: Record<string, { home: number; away: number }>
): GroupStanding {
  const pseudoMatches = matches
    .filter((m) => m.groupId === group.id && predictions[m.id])
    .map((m) => ({
      ...m,
      homeScore: predictions[m.id].home,
      awayScore: predictions[m.id].away,
    }));
  return computeGroupStanding(group, pseudoMatches);
}

export function computeAllPredictedStandings(
  groups: Group[],
  matches: Match[],
  predictions: Record<string, { home: number; away: number }>
): GroupStanding[] {
  return groups.map((g) => computeGroupStandingFromPredictions(g, matches, predictions));
}

export function buildGroupPredictionsFromMatches(
  groups: Group[],
  matches: Match[],
  predictions: Record<string, { home: number; away: number }>
) {
  const standings = groups.map((g) =>
    computeGroupStandingFromPredictions(g, matches, predictions)
  );
  const qualifyingThirds = computeThirdQualifierGroupsFromStandings(standings, false);

  return groups.map((g) => {
    const standing = standings.find((s) => s.groupId === g.id)!;
    const positions = standing.teams.map((t) => t.code) as [string, string, string, string];
    const complete = isGroupStandingComplete(standing);
    return {
      groupId: g.id,
      positions,
      thirdQualifies: complete && qualifyingThirds.has(g.id),
    };
  });
}

/** Resultats reals de grups per puntuació (ordre + si el 3r passa) */
export function buildGroupStandingsActuals(
  groups: Group[],
  matches: Match[]
): Record<string, { order: string[]; thirdQualifies: boolean; complete: boolean }> {
  const standings = computeAllGroupStandings(groups, matches);
  const qualifyingThirds = computeThirdQualifierGroupsFromStandings(standings, true);
  const result: Record<string, { order: string[]; thirdQualifies: boolean; complete: boolean }> = {};

  for (const s of standings) {
    const complete = isGroupStandingComplete(s);
    result[s.groupId] = {
      order: s.teams.map((t) => t.code),
      thirdQualifies: complete && qualifyingThirds.has(s.groupId),
      complete,
    };
  }

  return result;
}
