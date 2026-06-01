import { Match, Phase } from "@/types";
import { SCORING_RULES } from "@/data/world-cup-2026";
import { getMatchWinner, isMatchFinished } from "@/lib/knockout";

const BRACKET_SCORING_PHASES: Phase[] = [
  "round32",
  "round16",
  "quarter",
  "semi",
  "third",
  "final",
];

/** Punts per encertar el guanyador d'un partit al quadre (§6 regles) */
export function bracketPickPointsForPhase(phase: Phase): number {
  const r = SCORING_RULES.special;
  switch (phase) {
    case "round32":
      return r.round16Finalist;
    case "round16":
      return r.quarterFinalist;
    case "quarter":
      return r.semiFinalist;
    case "semi":
      return 0;
    case "third":
      return r.thirdPlace;
    case "final":
      return r.champion;
    default:
      return 0;
  }
}

export type BracketPickState = "pending" | "correct" | "wrong" | "unset";

export interface BracketPickEvaluation {
  state: BracketPickState;
  points: number;
  actualWinner: string | null;
}

export function evaluateBracketPick(match: Match, pick?: string): BracketPickEvaluation {
  if (!pick?.trim()) {
    return { state: "unset", points: 0, actualWinner: null };
  }

  if (!isMatchFinished(match)) {
    return { state: "pending", points: 0, actualWinner: null };
  }

  const actualWinner = getMatchWinner(match);
  if (!actualWinner) {
    return { state: "pending", points: 0, actualWinner: null };
  }

  if (pick === actualWinner) {
    return {
      state: "correct",
      points: bracketPickPointsForPhase(match.phase),
      actualWinner,
    };
  }

  return { state: "wrong", points: 0, actualWinner };
}

export interface BracketScoreSummary {
  totalPoints: number;
  correctPicks: number;
  wrongPicks: number;
  pendingPicks: number;
  byPhase: Partial<Record<Phase, { points: number; correct: number }>>;
}

export function summarizeBracketPickScore(
  realMatches: Match[],
  bracketPicks: Record<string, string>
): BracketScoreSummary {
  const summary: BracketScoreSummary = {
    totalPoints: 0,
    correctPicks: 0,
    wrongPicks: 0,
    pendingPicks: 0,
    byPhase: {},
  };

  for (const match of realMatches) {
    if (!BRACKET_SCORING_PHASES.includes(match.phase)) continue;

    const evaluation = evaluateBracketPick(match, bracketPicks[match.id]);
    if (evaluation.state === "unset") continue;

    if (evaluation.state === "pending") {
      summary.pendingPicks += 1;
      continue;
    }

    if (evaluation.state === "correct") {
      summary.correctPicks += 1;
      summary.totalPoints += evaluation.points;
      const phaseStats = summary.byPhase[match.phase] ?? { points: 0, correct: 0 };
      phaseStats.points += evaluation.points;
      phaseStats.correct += 1;
      summary.byPhase[match.phase] = phaseStats;
    } else {
      summary.wrongPicks += 1;
    }
  }

  return summary;
}

/** Punts totals del quadre per al rànquing (font única de veritat) */
export function scoreBracketPicks(
  realMatches: Match[],
  bracketPicks: Record<string, string> | undefined
): number {
  if (!bracketPicks || Object.keys(bracketPicks).length === 0) return 0;
  return summarizeBracketPickScore(realMatches, bracketPicks).totalPoints;
}
