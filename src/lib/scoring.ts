import {
  Match,
  Participant,
  ScoreBreakdown,
  ScorePrediction,
  SpecialPredictions,
} from "@/types";
import { SCORING_RULES } from "@/data/world-cup-2026";
import { derivePodiumFromPredictions } from "@/lib/mundial";

function getOutcome(h: number, a: number): "H" | "D" | "A" {
  if (h > a) return "H";
  if (h < a) return "A";
  return "D";
}

function scoreMatchPrediction(
  predicted: ScorePrediction,
  actual: ScorePrediction,
  phase: Match["phase"]
): number {
  const rules =
    phase === "groups" ? SCORING_RULES.group : SCORING_RULES.knockout;

  if (predicted.home === actual.home && predicted.away === actual.away) {
    return rules.exact;
  }

  const predOutcome = getOutcome(predicted.home, predicted.away);
  const actOutcome = getOutcome(actual.home, actual.away);
  const predDiff = predicted.home - predicted.away;
  const actDiff = actual.home - actual.away;

  if (predOutcome === actOutcome && predDiff === actDiff) {
    return "resultAndDiff" in rules ? rules.resultAndDiff : rules.winnerAndDiff;
  }

  if (predOutcome === actOutcome) {
    return "resultOnly" in rules ? rules.resultOnly : rules.winnerOnly;
  }

  return 0;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function scoreSpecialPredictions(
  special: SpecialPredictions | undefined,
  matches: Match[],
  matchPredictions: Record<string, ScorePrediction>,
  actuals: {
    champion?: string;
    runnerUp?: string;
    thirdPlace?: string;
    topScorer?: string;
    topAssists?: string;
    mvp?: string;
    youngMvp?: string;
    goldenGlove?: string;
    surpriseTeam?: string;
    firstEliminatedFavorite?: string;
    groupStandings?: Record<string, { order: string[]; thirdQualifies: boolean; complete?: boolean }>;
  }
): number {
  if (!special) return 0;

  let pts = 0;
  const r = SCORING_RULES.special;

  const podium = derivePodiumFromPredictions(matches, matchPredictions);
  if (actuals.champion && podium.champion && podium.champion === actuals.champion) pts += r.champion;
  if (actuals.runnerUp && podium.runnerUp && podium.runnerUp === actuals.runnerUp) pts += r.runnerUp;
  if (actuals.thirdPlace && podium.thirdPlace && podium.thirdPlace === actuals.thirdPlace) pts += r.thirdPlace;

  if (actuals.topScorer && norm(special.topScorer) === norm(actuals.topScorer)) pts += r.topScorer;
  if (actuals.topAssists && special.topAssists && norm(special.topAssists) === norm(actuals.topAssists)) pts += r.topAssists;
  if (actuals.mvp && special.mvp && norm(special.mvp) === norm(actuals.mvp)) pts += r.mvp;
  if (actuals.youngMvp && special.youngMvp && norm(special.youngMvp) === norm(actuals.youngMvp)) pts += r.youngMvp;
  if (actuals.goldenGlove && special.goldenGlove && norm(special.goldenGlove) === norm(actuals.goldenGlove)) pts += r.goldenGlove;

  if (actuals.surpriseTeam && special.surpriseTeam === actuals.surpriseTeam) pts += r.surpriseTeam;
  if (actuals.firstEliminatedFavorite && special.firstEliminatedFavorite === actuals.firstEliminatedFavorite) {
    pts += r.firstEliminatedFavorite;
  }

  for (const gp of special.groups) {
    const actual = actuals.groupStandings?.[gp.groupId];
    if (!actual) continue;

    const predOrder = gp.positions.join(",");
    const actOrder = actual.order.join(",");
    if (predOrder === actOrder) {
      pts += r.groupExactOrder;
    } else {
      const predTop2 = new Set(gp.positions.slice(0, 2));
      const actTop2 = new Set(actual.order.slice(0, 2));
      for (const t of predTop2) {
        if (actTop2.has(t)) pts += r.groupTopTwo;
      }
    }

    if (gp.thirdQualifies === actual.thirdQualifies && actual.complete) {
      pts += r.groupThirdQualifies;
    }
  }

  return pts;
}

export type SpecialActuals = Parameters<typeof scoreSpecialPredictions>[3];

export function calculateParticipantScore(
  participant: Participant,
  matches: Match[],
  specialActuals?: SpecialActuals
): { total: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    special: 0,
    groups: 0,
    round32: 0,
    round16: 0,
    quarter: 0,
    semi: 0,
    third: 0,
    final: 0,
  };

  for (const match of matches) {
    if (match.homeScore === undefined || match.awayScore === undefined) continue;

    const pred = participant.matches[match.id];
    if (!pred) continue;

    const pts = scoreMatchPrediction(
      pred,
      { home: match.homeScore, away: match.awayScore },
      match.phase
    );

    if (match.phase === "groups") breakdown.groups += pts;
    else breakdown[match.phase] += pts;
  }

  breakdown.special = scoreSpecialPredictions(
    participant.special,
    matches,
    participant.matches,
    specialActuals ?? {}
  );

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { total, breakdown };
}

export function calculateAllScores(
  participants: Participant[],
  matches: Match[],
  specialActuals?: SpecialActuals
) {
  return participants
    .map((p) => {
      const { total, breakdown } = calculateParticipantScore(p, matches, specialActuals);
      return { participantId: p.id, name: p.name, total, breakdown };
    })
    .sort((a, b) => b.total - a.total);
}

export function calculatePrizes(
  participantCount: number,
  entryFee: number,
  split: { first: number; second: number; third: number }
) {
  const pool = participantCount * entryFee;
  return {
    pool,
    first: Math.round((pool * split.first) / 100),
    second: Math.round((pool * split.second) / 100),
    third: Math.round((pool * split.third) / 100),
  };
}

export { scoreMatchPrediction, getOutcome, derivePodiumFromPredictions };
