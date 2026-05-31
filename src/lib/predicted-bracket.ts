/**
 * Quadre de prediccions: només dades reals del torneig (admin).
 * El participant tria qui passa (bracketPicks); no es simula ni es propaguen tries.
 */

import { Match } from "@/types";

/** Retorna partits KO tal com estan al torneig real (equips + marcadors oficials). */
export function getRealKnockoutMatchesForBracket(matches: Match[]): Match[] {
  return matches.map((m) => ({ ...m }));
}
