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
  surpriseTeamQualifies,
} from "@/lib/knockout-advancement";
import { scoreBracketPicks } from "@/lib/bracket-scoring";

function getOutcome(h: number, a: number): "H" | "D" | "A" {
  if (h > a) return "H";
  if (h < a) return "A";
  return "D";
}

/** 1 pt per 1/X/2 + 3 pts extra marcador exacte (4 total) */
function scoreMatchPrediction(
  predicted: ScorePrediction,
  actual: ScorePrediction
): number {
  const rules = SCORING_RULES.group;

  const predOutcome = getOutcome(predicted.home, predicted.away);
  const actOutcome = getOutcome(actual.home, actual.away);
  const outcomeCorrect = predOutcome === actOutcome;
  const exact =
    predicted.home === actual.home && predicted.away === actual.away;

  if (exact) {
    return rules.outcome + rules.exact;
  }

  if (outcomeCorrect) {
    return rules.outcome;
  }

  return 0;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

function teamListMatch(predicted: string, actualRaw?: string): boolean {
  if (!predicted?.trim() || !actualRaw?.trim()) return false;
  const codes = actualRaw.split(/[,;]/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  return codes.includes(predicted.trim().toUpperCase());
}

function playerMatch(predicted: string, actualRaw?: string): boolean {
  if (!predicted?.trim() || !actualRaw?.trim()) return false;
  const pred = norm(predicted);
  const actuals = actualRaw.split(/[,;]/).map((s) => norm(s)).filter(Boolean);
  return actuals.includes(pred);
}

/** Ordre exacte de grup (7 pts) — es prediu a la pestanya Grups → compta a "Grups" */
function scoreGroupOrder(
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

  return pts;
}

/**
 * GF, GC i 3r-que-no-passa: es trien a la pestanya Mundial → compten a "Mundial".
 */
function scoreGroupTeamSpecials(
  special: SpecialPredictions,
  actuals: SpecialActualsInput
): number {
  let pts = 0;
  const r = SCORING_RULES.special;

  if (
    actuals.nonQualifyingThird &&
    special.nonQualifyingThird &&
    actuals.nonQualifyingThird.includes(special.nonQualifyingThird)
  ) {
    pts += r.nonQualifyingThird;
  }

  if (actuals.mostGroupGoals && special.mostGroupGoals) {
    const actualCodes = Array.isArray(actuals.mostGroupGoals)
      ? actuals.mostGroupGoals.join(",")
      : actuals.mostGroupGoals;
    if (teamListMatch(special.mostGroupGoals, actualCodes)) {
      pts += r.mostGroupGoals;
    }
  }

  if (actuals.mostGroupGoalsConceded && special.mostGroupGoalsConceded) {
    const actualCodes = Array.isArray(actuals.mostGroupGoalsConceded)
      ? actuals.mostGroupGoalsConceded.join(",")
      : actuals.mostGroupGoalsConceded;
    if (teamListMatch(special.mostGroupGoalsConceded, actualCodes)) {
      pts += r.mostGroupGoalsConceded;
    }
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

  if (actuals.topScorer && special.topScorer && playerMatch(special.topScorer, actuals.topScorer)) {
    pts += r.topScorer;
  }
  if (actuals.topAssists && special.topAssists && playerMatch(special.topAssists, actuals.topAssists)) {
    pts += r.topAssists;
  }
  if (actuals.mvp && special.mvp && playerMatch(special.mvp, actuals.mvp)) pts += r.mvp;
  if (actuals.youngMvp && special.youngMvp && playerMatch(special.youngMvp, actuals.youngMvp)) {
    pts += r.youngMvp;
  }
  if (actuals.goldenGlove && special.goldenGlove && playerMatch(special.goldenGlove, actuals.goldenGlove)) {
    pts += r.goldenGlove;
  }

  if (actuals.surpriseTeam) {
    if (teamListMatch(special.surpriseTeam, actuals.surpriseTeam)) pts += r.surpriseTeam;
  } else if (
    special.surpriseTeam &&
    !isFifaTop10(special.surpriseTeam) &&
    surpriseTeamQualifies(special.surpriseTeam, matches)
  ) {
    pts += r.surpriseTeam;
  }

  if (actuals.disappointmentTeam) {
    if (teamListMatch(special.disappointmentTeam, actuals.disappointmentTeam)) pts += r.disappointmentTeam;
  } else if (
    special.disappointmentTeam &&
    isFifaTop10(special.disappointmentTeam) &&
    disappointmentTeamValid(special.disappointmentTeam, matches)
  ) {
    pts += r.disappointmentTeam;
  }

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
  mostGroupGoals?: string | string[] | null;
  mostGroupGoalsConceded?: string | string[] | null;
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
    // Ordre exacte de grup → Grups; GF/GC/3r-no-passa i la resta d'especials → Mundial
    breakdown.groups += scoreGroupOrder(special, actuals);
    breakdown.special =
      scoreMundialFields(special, actuals, matches) +
      scoreGroupTeamSpecials(special, actuals);
  }

  breakdown.advancement = scoreBracketPicks(matches, participant.bracketPicks);

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
  const first = Math.round((pool * split.first) / 100);
  const second = Math.round((pool * split.second) / 100);
  const third = pool - first - second;
  return { pool, first, second, third };
}

export { scoreMatchPrediction, getOutcome };
