"use client";

import { Match } from "@/types";
import { MatchScoreboard } from "@/components/MatchScoreboard";
import { MatchKickoff } from "@/components/MatchKickoff";
import { BracketLayout } from "@/components/BracketLayout";
import { BracketRoundMatches } from "@/components/BracketRoundMatches";
import { getBracketRounds, isMatchFinished, matchesByIdMap } from "@/lib/knockout";
import { PHASE_SHORT } from "@/data/phase-labels";

interface KnockoutBracketProps {
  matches: Match[];
}

export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const byId = matchesByIdMap(matches);
  const rounds = getBracketRounds();
  const finishedCount = matches.filter((m) => isMatchFinished(m)).length;

  return (
    <BracketLayout
      header={
        <p className="text-sm text-pitch-400 mb-4">
          {finishedCount} partits amb resultat · quadre complet per rondes
        </p>
      }
    >
      {rounds.map((round) => (
        <div key={round.phase} className="bracket-round">
          <div className="bracket-round-title">{PHASE_SHORT[round.phase] ?? round.name}</div>
          <BracketRoundMatches
            phase={round.phase}
            matchIds={round.matchIds}
            renderMatch={(id) => {
              const match = byId[id];
              if (!match) return null;
              const finished = isMatchFinished(match);
              return (
                <div
                  key={id}
                  className={`bracket-match card-glass rounded-lg sm:rounded-xl ${
                    finished ? "bracket-match-done" : ""
                  } ${round.phase === "final" ? "bracket-match-final" : ""}`}
                >
                  <MatchKickoff match={match} className="mb-1 hidden md:block" compact />
                  <MatchScoreboard match={match} variant="bracket" showKickoff={false} />
                </div>
              );
            }}
          />
        </div>
      ))}
    </BracketLayout>
  );
}

interface KnockoutPhaseListProps {
  matches: Match[];
  phase: string;
}

/** Vista per fase en mòbil — llista visual amb banderes */
export function KnockoutPhaseList({ matches, phase }: KnockoutPhaseListProps) {
  const phaseMatches = matches.filter((m) => m.phase === phase);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {phaseMatches.map((m) => (
        <div
          key={m.id}
          className={`card-glass rounded-xl p-4 ${isMatchFinished(m) ? "border-gold-500/30 border" : ""}`}
        >
          <MatchScoreboard match={m} variant="card" />
        </div>
      ))}
    </div>
  );
}
