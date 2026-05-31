import { Group, Match } from "@/types";

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
  return { code, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
}

function compareTeams(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.code.localeCompare(b.code);
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
    .sort(compareTeams)
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
