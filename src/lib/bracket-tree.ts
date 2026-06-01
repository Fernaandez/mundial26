import { Match } from "@/types";
import { getMatchWinner } from "@/lib/knockout";

export interface BracketAdvanceSlot {
  nextId: string;
  slot: "home" | "away";
}

const ADVANCE_MAP: Record<string, BracketAdvanceSlot> = {};
const LOSER_TO_THIRD: Record<string, BracketAdvanceSlot> = {};

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
LOSER_TO_THIRD["sf-1"] = { nextId: "third", slot: "home" };
LOSER_TO_THIRD["sf-2"] = { nextId: "third", slot: "away" };

const KO_PHASE_ORDER = ["round32", "round16", "quarter", "semi", "third", "final"] as const;

export function getBracketAdvanceSlot(matchId: string): BracketAdvanceSlot | undefined {
  return ADVANCE_MAP[matchId];
}

export function getBracketLoserToThirdSlot(matchId: string): BracketAdvanceSlot | undefined {
  return LOSER_TO_THIRD[matchId];
}

/** Partits avalsallats si canvia una tria upstream (guanyador + 3r lloc) */
export function getBracketCascadeClearIds(matchId: string): string[] {
  const cleared = new Set<string>();
  function walkWinnerPath(id: string) {
    const slot = ADVANCE_MAP[id];
    if (!slot) return;
    cleared.add(slot.nextId);
    walkWinnerPath(slot.nextId);
  }
  walkWinnerPath(matchId);
  if (LOSER_TO_THIRD[matchId]) {
    cleared.add("third");
  }
  return [...cleared];
}

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

  const loserSlot = LOSER_TO_THIRD[finishedMatchId];
  if (loserSlot && finished.homeTeam !== "TBD" && finished.awayTeam !== "TBD") {
    const loser = finished.homeTeam === winner ? finished.awayTeam : finished.homeTeam;
    const third = matches.find((m) => m.id === loserSlot.nextId);
    if (third) {
      if (loserSlot.slot === "home") third.homeTeam = loser;
      else third.awayTeam = loser;
    }
  }
}

export { KO_PHASE_ORDER };
