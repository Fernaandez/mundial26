import { Match, SpecialPredictions } from "@/types";
import { ScorePrediction } from "@/types";

export interface DerivedPodium {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

function winnerFromPrediction(
  match: Match,
  pred: ScorePrediction
): string | null {
  if (match.homeTeam === "TBD" || match.awayTeam === "TBD") return null;
  if (pred.home > pred.away) return match.homeTeam;
  if (pred.away > pred.home) return match.awayTeam;
  return null;
}

function loserFromPrediction(
  match: Match,
  pred: ScorePrediction
): string | null {
  if (match.homeTeam === "TBD" || match.awayTeam === "TBD") return null;
  if (pred.home > pred.away) return match.awayTeam;
  if (pred.away > pred.home) return match.homeTeam;
  return null;
}

/** Campió, subcampió i 3r lloc derivats de marcadors d'eliminatòria (només suggeriment) */
export function derivePodiumFromPredictions(
  matches: Match[],
  predictions: Record<string, ScorePrediction>
): DerivedPodium {
  const final = matches.find((m) => m.id === "final");
  const third = matches.find((m) => m.id === "third");
  const finalPred = final ? predictions[final.id] : undefined;
  const thirdPred = third ? predictions[third.id] : undefined;

  return {
    champion: final && finalPred ? winnerFromPrediction(final, finalPred) ?? "" : "",
    runnerUp: final && finalPred ? loserFromPrediction(final, finalPred) ?? "" : "",
    thirdPlace: third && thirdPred ? winnerFromPrediction(third, thirdPred) ?? "" : "",
  };
}

/** Font única per campió/3r: quadre primer, després special guardat */
export function resolvePodiumPredictions(
  special?: SpecialPredictions,
  bracketPicks?: Record<string, string>
): { champion: string; thirdPlace: string } {
  return {
    champion: bracketPicks?.final?.trim() || special?.champion?.trim() || "",
    thirdPlace: bracketPicks?.third?.trim() || special?.thirdPlace?.trim() || "",
  };
}

export const DEFAULT_MUNDIAL_FIELDS = {
  topScorer: "",
  topAssists: "",
  mvp: "",
  youngMvp: "",
  goldenGlove: "",
  surpriseTeam: "",
  disappointmentTeam: "",
  nonQualifyingThird: "",
  mostGroupGoals: "",
  mostGroupGoalsConceded: "",
  champion: "",
  thirdPlace: "",
} as const;

export const MUNDIAL_USER_FIELDS: (keyof Omit<SpecialPredictions, "groups">)[] = [
  "topScorer",
  "topAssists",
  "mvp",
  "youngMvp",
  "goldenGlove",
  "surpriseTeam",
  "disappointmentTeam",
  "nonQualifyingThird",
  "mostGroupGoals",
  "mostGroupGoalsConceded",
];

export const MUNDIAL_TOTAL_FIELDS = [...MUNDIAL_USER_FIELDS, "champion", "thirdPlace"] as const;

export function countMundialFilled(
  special?: SpecialPredictions,
  bracketPicks?: Record<string, string>
): number {
  let n = MUNDIAL_USER_FIELDS.filter((k) => {
    const v = special?.[k];
    return typeof v === "string" ? v.trim() !== "" : false;
  }).length;
  const podium = resolvePodiumPredictions(special, bracketPicks);
  if (podium.champion) n++;
  if (podium.thirdPlace) n++;
  return n;
}

export function hasMeaningfulMundialPredictions(
  special?: SpecialPredictions,
  bracketPicks?: Record<string, string>
): boolean {
  return countMundialFilled(special, bracketPicks) > 0;
}

/** Compatibilitat amb dades antigues */
export function normalizeSpecialPredictions(
  special?: Partial<SpecialPredictions> & { firstEliminatedFavorite?: string }
): SpecialPredictions | undefined {
  if (!special) return undefined;
  return {
    ...DEFAULT_MUNDIAL_FIELDS,
    ...special,
    disappointmentTeam:
      special.disappointmentTeam ||
      (special as { firstEliminatedFavorite?: string }).firstEliminatedFavorite ||
      "",
    groups: special.groups ?? [],
  };
}

/** Sincronitza campió/3r del quadre cap a special abans de desar */
export function applyBracketPodiumToSpecial(
  special: SpecialPredictions,
  bracketPicks?: Record<string, string>
): SpecialPredictions {
  const next = { ...special };
  if (bracketPicks?.final) next.champion = bracketPicks.final;
  if (bracketPicks?.third) next.thirdPlace = bracketPicks.third;
  return next;
}
