import { Group, Match, Phase } from "@/types";
import { getTeamIso } from "@/lib/flags";
import { PRIZE_SPLIT } from "@/data/rules-config";
import { applyScheduleToMatches } from "@/data/match-schedule";

const TEAMS: Record<string, { name: string }> = {
  MEX: { name: "México" },
  RSA: { name: "Sudáfrica" },
  KOR: { name: "Corea del Sur" },
  CZE: { name: "Chequia" },
  CAN: { name: "Canadá" },
  BIH: { name: "Bosnia y Herzegovina" },
  QAT: { name: "Catar" },
  SUI: { name: "Suiza" },
  BRA: { name: "Brasil" },
  MAR: { name: "Marruecos" },
  HAI: { name: "Haití" },
  SCO: { name: "Escocia" },
  USA: { name: "Estados Unidos" },
  PAR: { name: "Paraguay" },
  AUS: { name: "Australia" },
  TUR: { name: "Turquía" },
  GER: { name: "Alemania" },
  CUW: { name: "Curazao" },
  CIV: { name: "Costa de Marfil" },
  ECU: { name: "Ecuador" },
  NED: { name: "Países Bajos" },
  JPN: { name: "Japón" },
  SWE: { name: "Suecia" },
  TUN: { name: "Túnez" },
  BEL: { name: "Bélgica" },
  EGY: { name: "Egipto" },
  IRN: { name: "Irán" },
  NZL: { name: "Nueva Zelanda" },
  ESP: { name: "España" },
  CPV: { name: "Cabo Verde" },
  KSA: { name: "Arabia Saudí" },
  URU: { name: "Uruguay" },
  FRA: { name: "Francia" },
  SEN: { name: "Senegal" },
  IRQ: { name: "Irak" },
  NOR: { name: "Noruega" },
  ARG: { name: "Argentina" },
  ALG: { name: "Argelia" },
  AUT: { name: "Austria" },
  JOR: { name: "Jordania" },
  POR: { name: "Portugal" },
  COD: { name: "RD Congo" },
  UZB: { name: "Uzbekistán" },
  COL: { name: "Colombia" },
  ENG: { name: "Inglaterra" },
  CRO: { name: "Croacia" },
  GHA: { name: "Ghana" },
  PAN: { name: "Panamá" },
  TBD: { name: "Por definir" },
};

function team(code: string) {
  const t = TEAMS[code] ?? { name: code };
  return { code, name: t.name, iso: getTeamIso(code) ?? "" };
}

function groupMatches(groupId: string, teams: string[]): Match[] {
  const pairs: [number, number][] = [
    [0, 1],
    [2, 3],
    [0, 2],
    [1, 3],
    [0, 3],
    [1, 2],
  ];
  return pairs.map(([h, a], i) => ({
    id: `${groupId}-m${i + 1}`,
    phase: "groups" as Phase,
    groupId,
    homeTeam: teams[h],
    awayTeam: teams[a],
    locked: false,
  }));
}

const GROUP_DEFS: { id: string; name: string; teams: string[] }[] = [
  { id: "A", name: "Grup A", teams: ["MEX", "RSA", "KOR", "CZE"] },
  { id: "B", name: "Grup B", teams: ["CAN", "BIH", "QAT", "SUI"] },
  { id: "C", name: "Grup C", teams: ["BRA", "MAR", "HAI", "SCO"] },
  { id: "D", name: "Grup D", teams: ["USA", "PAR", "AUS", "TUR"] },
  { id: "E", name: "Grup E", teams: ["GER", "CUW", "CIV", "ECU"] },
  { id: "F", name: "Grup F", teams: ["NED", "JPN", "SWE", "TUN"] },
  { id: "G", name: "Grup G", teams: ["BEL", "EGY", "IRN", "NZL"] },
  { id: "H", name: "Grup H", teams: ["ESP", "CPV", "KSA", "URU"] },
  { id: "I", name: "Grup I", teams: ["FRA", "SEN", "IRQ", "NOR"] },
  { id: "J", name: "Grup J", teams: ["ARG", "ALG", "AUT", "JOR"] },
  { id: "K", name: "Grup K", teams: ["POR", "COD", "UZB", "COL"] },
  { id: "L", name: "Grup L", teams: ["ENG", "CRO", "GHA", "PAN"] },
];

export const GROUPS: Group[] = GROUP_DEFS.map((g) => ({
  id: g.id,
  name: g.name,
  teams: g.teams.map(team),
}));

export const GROUP_MATCHES: Match[] = GROUP_DEFS.flatMap((g) =>
  groupMatches(g.id, g.teams)
);

function ko(id: string, phase: Phase, home: string, away: string, label: string): Match {
  return { id, phase, homeTeam: home, awayTeam: away, locked: false, label };
}

export const KNOCKOUT_MATCHES: Match[] = [
  ...Array.from({ length: 16 }, (_, i) =>
    ko(`r32-${i + 1}`, "round32", "TBD", "TBD", `16ens de final ${i + 1}`)
  ),
  ...Array.from({ length: 8 }, (_, i) =>
    ko(`r16-${i + 1}`, "round16", "TBD", "TBD", `8ens de final ${i + 1}`)
  ),
  ...Array.from({ length: 4 }, (_, i) =>
    ko(`qf-${i + 1}`, "quarter", "TBD", "TBD", `Quart de final ${i + 1}`)
  ),
  ko("sf-1", "semi", "TBD", "TBD", "Semifinal 1"),
  ko("sf-2", "semi", "TBD", "TBD", "Semifinal 2"),
  ko("third", "third", "TBD", "TBD", "3r i 4t lloc"),
  ko("final", "final", "TBD", "TBD", "Final"),
];

export const ALL_MATCHES = applyScheduleToMatches([...GROUP_MATCHES, ...KNOCKOUT_MATCHES]);

export const KNOCKOUT_ROUNDS = [
  { phase: "round32" as Phase, name: "16ens de final", matchIds: KNOCKOUT_MATCHES.filter((m) => m.phase === "round32").map((m) => m.id) },
  { phase: "round16" as Phase, name: "8ens de final", matchIds: KNOCKOUT_MATCHES.filter((m) => m.phase === "round16").map((m) => m.id) },
  { phase: "quarter" as Phase, name: "Quarts de final", matchIds: KNOCKOUT_MATCHES.filter((m) => m.phase === "quarter").map((m) => m.id) },
  { phase: "semi" as Phase, name: "Semifinals", matchIds: KNOCKOUT_MATCHES.filter((m) => m.phase === "semi").map((m) => m.id) },
  { phase: "third" as Phase, name: "3r lloc", matchIds: ["third"] },
  { phase: "final" as Phase, name: "Final", matchIds: ["final"] },
];

export function getTeamInfo(code: string) {
  return team(code);
}

export function getAllTeams() {
  return Object.entries(TEAMS)
    .filter(([code]) => code !== "TBD")
    .map(([code, t]) => ({ code, name: t.name, iso: getTeamIso(code) ?? "" }));
}

export const TOURNAMENT_CONFIG = {
  id: "wc2026",
  name: "Copa del Món FIFA 2026",
  shortName: "Mundial 2026",
  entryFee: 15,
  currency: "€",
  prizeSplit: { first: PRIZE_SPLIT.first, second: PRIZE_SPLIT.second, third: PRIZE_SPLIT.third },
  minParticipants: 8,
  maxParticipants: 12,
  groups: GROUPS,
  matches: ALL_MATCHES,
  knockoutBracket: KNOCKOUT_ROUNDS,
};

export const SCORING_RULES = {
  /** 1 pt encert 1/X/2 + 3 pts extra exacte (4 total) */
  group: {
    outcome: 1,
    exact: 3,
  },
  knockout: {
    outcome: 1,
    exact: 3,
  },
  special: {
    groupExactOrder: 7,
    nonQualifyingThird: 10,
    mostGroupGoals: 10,
    mostGroupGoalsConceded: 10,
    topScorer: 15,
    topAssists: 15,
    goldenGlove: 10,
    mvp: 20,
    youngMvp: 10,
    surpriseTeam: 15,
    disappointmentTeam: 20,
    round16Finalist: 1,
    quarterFinalist: 5,
    semiFinalist: 10,
  },
};

export const PHASE_LABELS: Record<Phase, string> = {
  special: "Prediccions especials",
  groups: "Fase de grups",
  round32: "16ens de final",
  round16: "8ens de final",
  quarter: "Quarts de final",
  semi: "Semifinals",
  third: "3r lloc",
  final: "Final",
};

export const BREAKDOWN_LABELS: Record<keyof import("@/types").ScoreBreakdown, string> = {
  special: "Mundial (jugadors/seleccions)",
  groups: "Grups (partits + extras)",
  advancement: "Elim. (classificats + podi)",
  round32: "16ens de final",
  round16: "8ens de final",
  quarter: "Quarts de final",
  semi: "Semifinals",
  third: "3r lloc",
  final: "Final",
};
