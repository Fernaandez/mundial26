import {
  Match,
  Participant,
  ScoreBreakdown,
  ScorePrediction,
  SpecialPredictions,
} from "@/types";
import { SCORING_RULES } from "@/data/world-cup-2026";
import { isFifaTop10 } from "@/data/rules-config";
import {
  deriveAdvancementSets,
  disappointmentTeamValid,
  scoreAdvancementPoints,
  surpriseTeamQualifies,
} from "@/lib/knockout-advancement";

function getOutcome(h: number, a: number): "H" | "D" | "A" {
  if (h > a) return "H";
  if (h < a) return "A";
  return "D";
}

/** 1 pt per 1/X/2 · 3 pts marcador exacte */
function scoreMatchPrediction(
  predicted: ScorePrediction,
  actual: ScorePrediction
): number {
  const rules = SCORING_RULES.group;

  if (predicted.home === actual.home && predicted.away === actual.away) {
    return rules.exact;
  }

  const predOutcome = getOutcome(predicted.home, predicted.away);
  const actOutcome = getOutcome(actual.home, actual.away);

  if (predOutcome === actOutcome) {
    return rules.outcome;
  }

  return 0;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function scoreGroupExtras(
  special: SpecialPredictions,
  actuals: SpecialActualsInput
): number {
  let pts = 0;
  const r = SCORING_RULES.special;

  for (const gp of special.groups) {
    const actual = actuals.groupStandings?.[gp.groupId];
    if (!actual?.complete) continue;

    const predOrder = gp.positions.join(",");
    const actOrder = actual.order.join(",");
    if (predOrder === actOrder) {
      pts += r.groupExactOrder;
    }
  }

  if (
    actuals.nonQualifyingThird &&
    special.nonQualifyingThird &&
    actuals.nonQualifyingThird.includes(special.nonQualifyingThird)
  ) {
    pts += r.nonQualifyingThird;
  }

  if (actuals.mostGroupGoals && special.mostGroupGoals === actuals.mostGroupGoals) {
    pts += r.mostGroupGoals;
  }

  if (
    actuals.mostGroupGoalsConceded &&
    special.mostGroupGoalsConceded === actuals.mostGroupGoalsConceded
  ) {
    pts += r.mostGroupGoalsConceded;
  }

  return pts;
}

function scoreMundialFields(
  special: SpecialPredictions,
  actuals: SpecialActualsInput,
  matches: Match[]
): number {
  let pts = 0;
  const r = SCORING_RULES.special;

  if (actuals.topScorer && norm(special.topScorer) === norm(actuals.topScorer)) pts += r.topScorer;
  if (actuals.topAssists && special.topAssists && norm(special.topAssists) === norm(actuals.topAssists)) {
    pts += r.topAssists;
  }
  if (actuals.mvp && special.mvp && norm(special.mvp) === norm(actuals.mvp)) pts += r.mvp;
  if (actuals.youngMvp && special.youngMvp && norm(special.youngMvp) === norm(actuals.youngMvp)) {
    pts += r.youngMvp;
  }
  if (actuals.goldenGlove && special.goldenGlove && norm(special.goldenGlove) === norm(actuals.goldenGlove)) {
    pts += r.goldenGlove;
  }

  if (
    special.surpriseTeam &&
    !isFifaTop10(special.surpriseTeam) &&
    surpriseTeamQualifies(special.surpriseTeam, matches)
  ) {
    pts += r.surpriseTeam;
  }

  if (
    special.disappointmentTeam &&
    isFifaTop10(special.disappointmentTeam) &&
    disappointmentTeamValid(special.disappointmentTeam, matches)
  ) {
    pts += r.disappointmentTeam;
  }

  return pts;
}

function scoreKnockoutAdvancement(
  matches: Match[],
  matchPredictions: Record<string, ScorePrediction>,
  actuals: SpecialActualsInput
): number {
  let pts = 0;
  const r = SCORING_RULES.special;

  const predAdv = deriveAdvancementSets(matches, matchPredictions);
  const actAdv = actuals.advancement ?? deriveAdvancementSets(matches);

  pts += scoreAdvancementPoints(predAdv, actAdv, {
    round16: r.round16Finalist,
    quarter: r.quarterFinalist,
    semi: r.semiFinalist,
  });

  return pts;
}

export interface SpecialActualsInput {
  champion?: string;
  thirdPlace?: string;
  topScorer?: string;
  topAssists?: string;
  mvp?: string;
  youngMvp?: string;
  goldenGlove?: string;
  surpriseTeam?: string;
  disappointmentTeam?: string;
  surpriseTeamValid?: boolean;
  disappointmentTeamValid?: boolean;
  nonQualifyingThird?: string[];
  mostGroupGoals?: string | null;
  mostGroupGoalsConceded?: string | null;
  groupStandings?: Record<string, { order: string[]; thirdQualifies: boolean; complete?: boolean }>;
  advancement?: ReturnType<typeof deriveAdvancementSets>;
}

export type SpecialActuals = SpecialActualsInput;

export function calculateParticipantScore(
  participant: Participant,
  matches: Match[],
  specialActuals?: SpecialActuals
): { total: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    special: 0,
    groups: 0,
    advancement: 0,
    round32: 0,
    round16: 0,
    quarter: 0,
    semi: 0,
    third: 0,
    final: 0,
  };

  const actuals = specialActuals ?? {};
  const special = participant.special;

  for (const match of matches) {
    if (match.homeScore === undefined || match.awayScore === undefined) continue;

    const pred = participant.matches[match.id];
    if (!pred) continue;

    const pts = scoreMatchPrediction(pred, {
      home: match.homeScore,
      away: match.awayScore,
    });

    if (match.phase === "groups") breakdown.groups += pts;
    else breakdown[match.phase] += pts;
  }

  if (special) {
    breakdown.groups += scoreGroupExtras(special, actuals);
    breakdown.special = scoreMundialFields(special, actuals, matches);
    breakdown.advancement = scoreKnockoutAdvancement(
      matches,
      participant.matches,
      actuals
    );
  }

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

export { scoreMatchPrediction, getOutcome };
