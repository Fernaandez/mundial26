"use client";

import { Match } from "@/types";
import { MatchScoreboard } from "@/components/MatchScoreboard";
import { getBracketRounds, isMatchFinished, matchesByIdMap } from "@/lib/knockout";

interface KnockoutBracketProps {
  matches: Match[];
}

export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const byId = matchesByIdMap(matches);
  const rounds = getBracketRounds();

  const finishedCount = matches.filter((m) => isMatchFinished(m)).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-pitch-400">
          {finishedCount} partits amb resultat · desplaça&apos;t per veure tot el quadre →
        </p>
      </div>

      <div className="bracket-scroll">
        {rounds.map((round) => (
          <div key={round.phase} className="bracket-round">
            <div className="bracket-round-title">{round.name}</div>
            <div className="bracket-round-matches">
              {round.matchIds.map((id) => {
                const match = byId[id];
                if (!match) return null;
                const finished = isMatchFinished(match);
                return (
                  <div
                    key={id}
                    className={`bracket-match card-glass rounded-xl p-3 ${
                      finished ? "bracket-match-done" : ""
                    } ${round.phase === "final" ? "bracket-match-final" : ""}`}
                  >
                    <MatchScoreboard match={match} variant="bracket" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
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
