import { Group, Match, Phase } from "@/types";

const TEAMS: Record<string, { name: string; flag: string }> = {
  MEX: { name: "Mèxic", flag: "🇲🇽" },
  RSA: { name: "Sud-àfrica", flag: "🇿🇦" },
  KOR: { name: "Corea del Sud", flag: "🇰🇷" },
  CZE: { name: "Txèquia", flag: "🇨🇿" },
  CAN: { name: "Canadà", flag: "🇨🇦" },
  BIH: { name: "Bòsnia", flag: "🇧🇦" },
  QAT: { name: "Qatar", flag: "🇶🇦" },
  SUI: { name: "Suïssa", flag: "🇨🇭" },
  BRA: { name: "Brasil", flag: "🇧🇷" },
  MAR: { name: "Marroc", flag: "🇲🇦" },
  HAI: { name: "Haití", flag: "🇭🇹" },
  SCO: { name: "Escòcia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  USA: { name: "Estats Units", flag: "🇺🇸" },
  PAR: { name: "Paraguai", flag: "🇵🇾" },
  AUS: { name: "Austràlia", flag: "🇦🇺" },
  TUR: { name: "Turquia", flag: "🇹🇷" },
  GER: { name: "Alemanya", flag: "🇩🇪" },
  CUW: { name: "Curaçao", flag: "🇨🇼" },
  CIV: { name: "Costa d'Ivori", flag: "🇨🇮" },
  ECU: { name: "Equador", flag: "🇪🇨" },
  NED: { name: "Països Baixos", flag: "🇳🇱" },
  JPN: { name: "Japó", flag: "🇯🇵" },
  SWE: { name: "Suècia", flag: "🇸🇪" },
  TUN: { name: "Tunísia", flag: "🇹🇳" },
  BEL: { name: "Bèlgica", flag: "🇧🇪" },
  EGY: { name: "Egipte", flag: "🇪🇬" },
  IRN: { name: "Iran", flag: "🇮🇷" },
  NZL: { name: "Nova Zelanda", flag: "🇳🇿" },
  ESP: { name: "Espanya", flag: "🇪🇸" },
  CPV: { name: "Cap Verd", flag: "🇨🇻" },
  KSA: { name: "Aràbia Saudita", flag: "🇸🇦" },
  URU: { name: "Uruguai", flag: "🇺🇾" },
  FRA: { name: "França", flag: "🇫🇷" },
  SEN: { name: "Senegal", flag: "🇸🇳" },
  IRQ: { name: "Iraq", flag: "🇮🇶" },
  NOR: { name: "Noruega", flag: "🇳🇴" },
  ARG: { name: "Argentina", flag: "🇦🇷" },
  ALG: { name: "Algèria", flag: "🇩🇿" },
  AUT: { name: "Àustria", flag: "🇦🇹" },
  JOR: { name: "Jordània", flag: "🇯🇴" },
  POR: { name: "Portugal", flag: "🇵🇹" },
  COD: { name: "Congo DR", flag: "🇨🇩" },
  UZB: { name: "Uzbekistan", flag: "🇺🇿" },
  COL: { name: "Colòmbia", flag: "🇨🇴" },
  ENG: { name: "Anglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  CRO: { name: "Croàcia", flag: "🇭🇷" },
  GHA: { name: "Ghana", flag: "🇬🇭" },
  PAN: { name: "Panamà", flag: "🇵🇦" },
  TBD: { name: "Per definir", flag: "❓" },
};

function team(code: string) {
  const t = TEAMS[code] ?? { name: code, flag: "🏳️" };
  return { code, name: t.name, flag: t.flag };
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
    ko(`r32-${i + 1}`, "round32", "TBD", "TBD", `32ens de final ${i + 1}`)
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
  { phase: "round32" as Phase, name: "32ens de final", matchIds: KNOCKOUT_MATCHES.filter((m) => m.phase === "round32").map((m) => m.id) },
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
    .map(([code, t]) => ({ code, ...t }));
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
    champion: 20,
    runnerUp: 12,
    thirdPlace: 8,
    topScorer: 10,
    totalGoalsExact: 8,
    totalGoalsWithin5: 4,
    groupExactOrder: 6,
    groupTopTwo: 2,
    groupThirdQualifies: 3,
  },
};

export const PHASE_LABELS: Record<Phase, string> = {
  special: "Prediccions especials",
  groups: "Fase de grups",
  round32: "32ens de final",
  round16: "8ens de final",
  quarter: "Quarts de final",
  semi: "Semifinals",
  third: "3r lloc",
  final: "Final",
};
