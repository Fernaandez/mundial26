/** Normes oficials porra — PORRA MUNDIAL 2026 v2 */

export const ENTRY_FEE = 15;

export const PRIZE_SPLIT = { first: 70, second: 20, third: 10 } as const;

/** Top 10 FIFA (31 maig 2026) — per selecció decepció */
export const FIFA_TOP_10_CODES = [
  "ESP", "FRA", "ENG", "GER", "POR", "ARG", "BRA", "MAR", "BEL", "NED",
] as const;

export const DEADLINES = {
  groupsSubmit: "Dimecres 10 de juny de 2026, 23:59h",
  groupsEndKnockoutOpen: "Dissabte 28 de juny de 2026, 04:00h (acaba fase de grups)",
  knockoutSubmit: "Dissabte 28 de juny de 2026, 20:59h (comencen els 1/16 de final)",
} as const;

export const RULES_NOTES = {
  payment: "15€ a pagar/cobrar quan s'acabi la final.",
  prizesNote: "Repartiment pendent de canvis segons el nombre de participants.",
  youngPlayer: "MVP jove: jugadors nascuts l'1 de gener de 2005 o després (21 anys o menys el 2026).",
  surpriseTeam:
    "Selecció revelació: qualsevol selecció excepte el top 10 FIFA. Només compta si classifica com a mínim als quarts de final.",
  disappointmentTeam:
    "Selecció decepció: tria entre el top 10 FIFA. Només compta si queda eliminada abans d'arribar als vuitens de final (8ens).",
  topScorerTie: "Màxim golejador i assistent: en cas d'empat, es dona per vàlid.",
} as const;

export function isFifaTop10(code: string): boolean {
  return (FIFA_TOP_10_CODES as readonly string[]).includes(code);
}

export function teamsOutsideTop10(allCodes: string[]): string[] {
  return allCodes.filter((c) => c !== "TBD" && !isFifaTop10(c));
}
