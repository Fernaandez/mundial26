import { Match } from "@/types";
import { getMatchWinner } from "@/lib/knockout";

const ADVANCE_MAP: Record<string, { nextId: string; slot: "home" | "away" }> = {};

function pairToNext(fromPrefix: string, count: number, toPrefix: string) {
  for (let i = 1; i <= count; i++) {
    const nextIdx = Math.ceil(i / 2);
    const slot: "home" | "away" = i % 2 === 1 ? "home" : "away";
    ADVANCE_MAP[`${fromPrefix}-${i}`] = { nextId: `${toPrefix}-${nextIdx}`, slot };
  }
}

pairToNext("r32", 16, "r16");
pairToNext("r16", 8, "qf");
pairToNext("qf", 4, "sf");
ADVANCE_MAP["sf-1"] = { nextId: "final", slot: "home" };
ADVANCE_MAP["sf-2"] = { nextId: "final", slot: "away" };

export function propagateKnockoutWinner(matches: Match[], finishedMatchId: string): void {
  const finished = matches.find((m) => m.id === finishedMatchId);
  if (!finished) return;

  const winner = getMatchWinner(finished);
  if (!winner || winner === "TBD") return;

  const slot = ADVANCE_MAP[finishedMatchId];
  if (!slot) return;

  const next = matches.find((m) => m.id === slot.nextId);
  if (!next) return;

  if (slot.slot === "home") {
    next.homeTeam = winner;
  } else {
    next.awayTeam = winner;
  }
}
