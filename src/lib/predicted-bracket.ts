import { Match } from "@/types";
import { GroupStanding } from "@/lib/standings";
import { buildKnockoutMatchesFromStandings } from "@/lib/assign-r32-from-groups";

/** r32-i → r16-j, slot home/away */
const FEEDERS: Record<string, { nextId: string; slot: "home" | "away" }> = {};

function pairFeeders(fromPrefix: string, count: number, toPrefix: string) {
  for (let i = 1; i <= count; i++) {
    const nextIdx = Math.ceil(i / 2);
    FEEDERS[`${fromPrefix}-${i}`] = {
      nextId: `${toPrefix}-${nextIdx}`,
      slot: i % 2 === 1 ? "home" : "away",
    };
  }
}

pairFeeders("r32", 16, "r16");
pairFeeders("r16", 8, "qf");
pairFeeders("qf", 4, "sf");
FEEDERS["sf-1"] = { nextId: "final", slot: "home" };
FEEDERS["sf-2"] = { nextId: "final", slot: "away" };

/**
 * Quadre de prediccions:
 * 1) Omple setzens des de la simulació de grups de l'usuari
 * 2) Propaga guanyadors triats als vuitens+
 */
export function enrichKnockoutDisplayTeams(
  matches: Match[],
  bracketPicks: Record<string, string>,
  groupStandings?: GroupStanding[]
): Match[] {
  const base =
    groupStandings && groupStandings.length > 0
      ? buildKnockoutMatchesFromStandings(matches, groupStandings)
      : matches.map((m) => ({ ...m }));

  const display: Record<string, Match> = Object.fromEntries(
    base.map((m) => [m.id, { ...m }])
  );

  const pickOrder = [
    ...Array.from({ length: 16 }, (_, i) => `r32-${i + 1}`),
    ...Array.from({ length: 8 }, (_, i) => `r16-${i + 1}`),
    ...Array.from({ length: 4 }, (_, i) => `qf-${i + 1}`),
    "sf-1",
    "sf-2",
    "third",
    "final",
  ];

  for (const matchId of pickOrder) {
    const pick = bracketPicks[matchId];
    if (!pick || pick === "TBD") continue;

    const slot = FEEDERS[matchId];
    if (!slot) continue;

    const next = display[slot.nextId];
    if (!next) continue;

    if (slot.slot === "home") {
      display[slot.nextId] = { ...next, homeTeam: pick };
    } else {
      display[slot.nextId] = { ...next, awayTeam: pick };
    }
  }

  return matches.map((m) => display[m.id] ?? m);
}

export function getKnockoutMatchesForPredictions(
  matches: Match[],
  groupStandings: GroupStanding[]
): Match[] {
  return buildKnockoutMatchesFromStandings(matches, groupStandings);
}
