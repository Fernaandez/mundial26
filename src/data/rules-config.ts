/** Normes oficials porra — PORRA MUNDIAL 2026 v2 */

export const ENTRY_FEE = 15;

export const PRIZE_SPLIT = { first: 70, second: 20, third: 10 } as const;

/** Top 10 FIFA (31 maig 2026) — per selecció decepció */
export const FIFA_TOP_10_CODES = [
  "ESP", "FRA", "ENG", "GER", "POR", "ARG", "BRA", "MAR", "BEL", "NED",
] as const;

export const SUBMISSION_DEADLINES: { phase: string; limit: string }[] = [];

export const DEADLINES = {
  groupsSubmit: "Dimecres 10 de juny de 2026, 23:59h",
  setzensOpen: "Dissabte 28 de juny de 2026, 04:00h",
  setzensClose: "Dissabte 28 de juny de 2026, 20:59h",
} as const;

/** Dates fixes (Europe/Madrid) per finestres de predicció */
export const FIXED_DEADLINES = {
  groupsSpecialClose: new Date("2026-06-10T23:59:00+02:00"),
  setzensOpen: new Date("2026-06-28T04:00:00+02:00"),
  setzensClose: new Date("2026-06-28T20:59:00+02:00"),
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
