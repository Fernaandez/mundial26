/** Normes oficials porra — PORRA MUNDIAL 2026 v2 */

export const ENTRY_FEE = 15;

export const PRIZE_SPLIT = { first: 70, second: 20, third: 10 } as const;

/** Top 10 FIFA (31 maig 2026) — per selecció decepció */
export const FIFA_TOP_10_CODES = [
  "ESP", "FRA", "ENG", "GER", "POR", "ARG", "BRA", "MAR", "BEL", "NED",
] as const;

export const SUBMISSION_DEADLINES: { phase: string; limit: string }[] = [];

export const DEADLINES = {
  /** Text orientatiu — les dates reals surten del calendari (match-schedule.ts) */
  groupsSubmit: "Fins al kickoff del primer partit de fase de grups",
  setzensBracket: "Kickoff darrer partit de grups → kickoff primer Setzens",
} as const;

/** @deprecated Les finestres es calculen des del calendari a prediction-deadlines.ts */
export const FIXED_DEADLINES = {
  groupsSpecialClose: new Date("2026-06-11T21:00:00+02:00"),
  setzensOpen: new Date("2026-06-28T04:00:00+02:00"),
  setzensClose: new Date("2026-06-28T21:00:00+02:00"),
} as const;

export const RULES_NOTES = {
  prizesNote: "El pot total és el nombre de participants × 15€.",
  youngPlayer: "MVP jove: jugadors nascuts l'1 de gener de 2005 o després (21 anys o menys el 2026).",
  surpriseTeam:
    "Selecció revelació: qualsevol selecció excepte el top 10 FIFA. Només compta si classifica com a mínim als quarts de final.",
  disappointmentTeam:
    "Selecció decepció: tria entre el top 10 FIFA. Només compta si queda eliminada abans d'arribar als vuitens de final.",
  topScorerTie: "Màxim golejador i assistent: en cas d'empat, es dona per vàlid.",
} as const;

export function isFifaTop10(code: string): boolean {
  return (FIFA_TOP_10_CODES as readonly string[]).includes(code);
}

export function teamsOutsideTop10(allCodes: string[]): string[] {
  return allCodes.filter((c) => c !== "TBD" && !isFifaTop10(c));
}
