export type Phase =
  | "special"
  | "groups"
  | "round32"
  | "round16"
  | "quarter"
  | "semi"
  | "third"
  | "final";

export interface Team {
  code: string;
  name: string;
  iso: string;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
}

export interface Match {
  id: string;
  phase: Phase;
  groupId?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
  locked: boolean;
  label?: string;
}

export interface ScorePrediction {
  home: number;
  away: number;
}

export interface GroupStandingPrediction {
  groupId: string;
  positions: [string, string, string, string];
  thirdQualifies: boolean;
}

export interface SpecialPredictions {
  topScorer: string;
  topAssists: string;
  mvp: string;
  youngMvp: string;
  goldenGlove: string;
  surpriseTeam: string;
  firstEliminatedFavorite: string;
  groups: GroupStandingPrediction[];
}

export interface MatchPrediction {
  matchId: string;
  home: number;
  away: number;
}

export interface Participant {
  id: string;
  name: string;
  pin: string;
  entryFeePaid: boolean;
  joinedAt: string;
  special?: SpecialPredictions;
  matches: Record<string, ScorePrediction>;
}

export interface TournamentConfig {
  id: string;
  name: string;
  shortName: string;
  entryFee: number;
  currency: string;
  prizeSplit: { first: number; second: number; third: number };
  minParticipants: number;
  maxParticipants: number;
  groups: Group[];
  matches: Match[];
  knockoutBracket: KnockoutRound[];
}

export interface KnockoutRound {
  phase: Phase;
  name: string;
  matchIds: string[];
}

export interface ParticipantScore {
  participantId: string;
  name: string;
  total: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  special: number;
  groups: number;
  round32: number;
  round16: number;
  quarter: number;
  semi: number;
  third: number;
  final: number;
}

export interface AppData {
  tournament: TournamentConfig;
  participants: Participant[];
  adminPin: string;
}
