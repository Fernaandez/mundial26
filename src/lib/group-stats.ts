import { Group, Match } from "@/types";
import { computeAllGroupStandings, computeBestThirdsRanking, isGroupStandingComplete } from "@/lib/standings";

export interface GroupStageStats {
  /** Seleccions 3es que NO passen entre els 8 millors 3rs */
  nonQualifyingThirds: string[];
  /** Seleccions empatades com a màximes golejadores (GF) a fase de grups */
  mostGoals: string[];
  /** Seleccions empatades amb més gols encaixats (GC) a fase de grups */
  mostGoalsConceded: string[];
}

function pickExtremes(
  standings: ReturnType<typeof computeAllGroupStandings>,
  field: "gf" | "ga"
): string[] {
  let maxValue: number | null = null;
  const tied: string[] = [];

  for (const s of standings) {
    if (!isGroupStandingComplete(s)) continue;
    for (const t of s.teams) {
      const value = field === "gf" ? t.gf : t.ga;
      if (maxValue === null || value > maxValue) {
        maxValue = value;
        tied.length = 0;
        tied.push(t.code);
      } else if (value === maxValue) {
        tied.push(t.code);
      }
    }
  }

  return tied;
}

/** Estadístiques reals de la fase de grups (per puntuació) */
export function computeGroupStageStats(groups: Group[], matches: Match[]): GroupStageStats {
  const standings = computeAllGroupStandings(groups, matches);
  const bestThirds = computeBestThirdsRanking(standings, { requireComplete: true });
  const qualifyingGroups = new Set(bestThirds.filter((e) => e.qualifies).map((e) => e.groupId));

  const nonQualifyingThirds: string[] = [];
  for (const s of standings) {
    if (!isGroupStandingComplete(s)) continue;
    if (qualifyingGroups.has(s.groupId)) continue;
    const third = s.teams.find((t) => t.position === 3);
    if (third) nonQualifyingThirds.push(third.code);
  }

  return {
    nonQualifyingThirds,
    mostGoals: pickExtremes(standings, "gf"),
    mostGoalsConceded: pickExtremes(standings, "ga"),
  };
}
