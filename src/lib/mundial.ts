import { Match } from "@/types";
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

/** Campió, subcampió i 3r lloc derivats de les prediccions d'eliminatòries */
export function derivePodiumFromPredictions(
  matches: Match[],
  predictions: Record<string, ScorePrediction>
): DerivedPodium {
  const empty = { champion: "", runnerUp: "", thirdPlace: "" };
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

export const DEFAULT_MUNDIAL_FIELDS = {
  topScorer: "",
  topAssists: "",
  mvp: "",
  youngMvp: "",
  goldenGlove: "",
  surpriseTeam: "",
  firstEliminatedFavorite: "",
} as const;
