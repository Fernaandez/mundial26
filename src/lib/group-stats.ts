import { Group, Match } from "@/types";
import { computeAllGroupStandings, computeBestThirdsRanking, isGroupStandingComplete } from "@/lib/standings";

export interface GroupStageStats {
  /** Seleccions 3es que NO passen entre els 8 millors 3rs */
  nonQualifyingThirds: string[];
  /** Selecció amb més gols a favor a fase de grups */
  mostGoals: string | null;
  /** Selecció amb més gols en contra a fase de grups */
  mostGoalsConceded: string | null;
}

function pickExtreme(
  standings: ReturnType<typeof computeAllGroupStandings>,
  field: "gf" | "ga"
): string | null {
  let best: { code: string; value: number } | null = null;

  for (const s of standings) {
    if (!isGroupStandingComplete(s)) continue;
    for (const t of s.teams) {
      const value = field === "gf" ? t.gf : t.ga;
      if (!best || value > best.value || (value === best.value && t.code < best.code)) {
        best = { code: t.code, value };
      }
    }
  }

  return best?.code ?? null;
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
    mostGoals: pickExtreme(standings, "gf"),
    mostGoalsConceded: pickExtreme(standings, "ga"),
  };
}
