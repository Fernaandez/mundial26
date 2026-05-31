import { Group, Match, Phase } from "@/types";
import { getTeamIso } from "@/lib/flags";

const TEAMS: Record<string, { name: string }> = {
  MEX: { name: "Mèxic" },
  RSA: { name: "Sud-àfrica" },
  KOR: { name: "Corea del Sud" },
  CZE: { name: "Txèquia" },
  CAN: { name: "Canadà" },
  BIH: { name: "Bòsnia" },
  QAT: { name: "Qatar" },
  SUI: { name: "Suïssa" },
  BRA: { name: "Brasil" },
  MAR: { name: "Marroc" },
  HAI: { name: "Haití" },
  SCO: { name: "Escòcia" },
  USA: { name: "Estats Units" },
  PAR: { name: "Paraguai" },
  AUS: { name: "Austràlia" },
  TUR: { name: "Turquia" },
  GER: { name: "Alemanya" },
  CUW: { name: "Curaçao" },
  CIV: { name: "Costa d'Ivori" },
  ECU: { name: "Equador" },
  NED: { name: "Països Baixos" },
  JPN: { name: "Japó" },
  SWE: { name: "Suècia" },
  TUN: { name: "Tunísia" },
  BEL: { name: "Bèlgica" },
  EGY: { name: "Egipte" },
  IRN: { name: "Iran" },
  NZL: { name: "Nova Zelanda" },
  ESP: { name: "Espanya" },
  CPV: { name: "Cap Verd" },
  KSA: { name: "Aràbia Saudita" },
  URU: { name: "Uruguai" },
  FRA: { name: "França" },
  SEN: { name: "Senegal" },
  IRQ: { name: "Iraq" },
  NOR: { name: "Noruega" },
  ARG: { name: "Argentina" },
  ALG: { name: "Algèria" },
  AUT: { name: "Àustria" },
  JOR: { name: "Jordània" },
  POR: { name: "Portugal" },
  COD: { name: "Congo DR" },
  UZB: { name: "Uzbekistan" },
  COL: { name: "Colòmbia" },
  ENG: { name: "Anglaterra" },
  CRO: { name: "Croàcia" },
  GHA: { name: "Ghana" },
  PAN: { name: "Panamà" },
  TBD: { name: "Per definir" },
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

export const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];

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
  prizeSplit: { first: 50, second: 30, third: 20 },
  minParticipants: 8,
  maxParticipants: 12,
  groups: GROUPS,
  matches: ALL_MATCHES,
  knockoutBracket: KNOCKOUT_ROUNDS,
};

export const SCORING_RULES = {
  group: {
    exact: 4,
    resultAndDiff: 2,
    resultOnly: 1,
  },
  knockout: {
    exact: 8,
    winnerAndDiff: 4,
    winnerOnly: 2,
  },
  special: {
    topScorer: 10,
    topAssists: 8,
    mvp: 12,
    youngMvp: 10,
    goldenGlove: 8,
    surpriseTeam: 6,
    firstEliminatedFavorite: 8,
    /** Podi: es calcula de les prediccions d'eliminatòries */
    champion: 20,
    runnerUp: 12,
    thirdPlace: 8,
    groupExactOrder: 6,
    groupTopTwo: 2,
    groupThirdQualifies: 3,
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
