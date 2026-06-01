"use client";

import { Match } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { getBracketRounds, isMatchFinished } from "@/lib/knockout";
import { bothTeamsReady } from "@/lib/predicted-bracket";
import { BracketLayout } from "@/components/BracketLayout";
import { BracketRoundMatches } from "@/components/BracketRoundMatches";
import { ScoreInputs } from "@/components/PredictionForms";
import { PHASE_SHORT } from "@/data/phase-labels";

interface KnockoutMarcadoresBracketProps {
  matches: Match[];
  predictions: Record<string, { home: number; away: number }>;
  onChange: (matchId: string, pred: { home: number; away: number } | null) => void;
  isMatchEditable: (match: Match) => boolean;
  readOnly?: boolean;
}

/** Marcadors KO en layout de quadre — partits reals, poc a poc */
export function KnockoutMarcadoresBracket({
  matches,
  predictions,
  onChange,
  isMatchEditable,
  readOnly,
}: KnockoutMarcadoresBracketProps) {
  const rounds = getBracketRounds();
  const byId = Object.fromEntries(matches.map((m) => [m.id, m]));

  return (
    <BracketLayout
      header={
        !readOnly ? (
          <p className="text-sm text-pitch-400 mb-4">
            Marcadors a 90 minuts del torneig real. Empats compten (1 pt si encertes X; 1-1 vs 2-2
            vàlid). Omple cada ronda quan s&apos;obri la finestra i els equips estiguin definits.
          </p>
        ) : null
      }
    >
      {rounds.map((round) => (
        <div key={round.phase} className="bracket-round">
          <div className="bracket-round-title flex-col gap-0.5">
            <span className="leading-tight">{PHASE_SHORT[round.phase] ?? round.name}</span>
          </div>
          <BracketRoundMatches
            phase={round.phase}
            matchIds={round.matchIds}
            renderMatch={(id) => {
              const match = byId[id];
              if (!match) return null;
              return (
                <MarcadorBracketMatch
                  key={id}
                  match={match}
                  prediction={predictions[id]}
                  onChange={(pred) => onChange(id, pred)}
                  disabled={readOnly || !isMatchEditable(match)}
                />
              );
            }}
          />
        </div>
      ))}
    </BracketLayout>
  );
}

function MarcadorBracketMatch({
  match,
  prediction,
  onChange,
  disabled,
}: {
  match: Match;
  prediction?: { home: number; away: number };
  onChange: (pred: { home: number; away: number } | null) => void;
  disabled?: boolean;
}) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const ready = bothTeamsReady(match);
  const finished = isMatchFinished(match);

  if (!ready) {
    return (
      <div className="bracket-match card-glass rounded-lg sm:rounded-xl p-2 sm:p-2.5 min-w-0 opacity-50">
        <div className="text-center text-[10px] text-pitch-500 py-3">Equips per definir</div>
      </div>
    );
  }

  return (
    <div
      className={`bracket-match card-glass rounded-lg sm:rounded-xl p-2 sm:p-2.5 min-w-0 space-y-1.5 ${
        finished ? "bracket-match-done" : ""
      } ${match.phase === "final" ? "bracket-match-final" : ""}`}
    >
      {finished && (
        <div className="text-center text-[10px] tabular-nums text-pitch-500">
          Oficial: {match.homeScore}–{match.awayScore}
        </div>
      )}
      <ScoreInputs
        homeCode={home.code}
        awayCode={away.code}
        homeName={home.name}
        awayName={away.name}
        prediction={prediction}
        onChange={onChange}
        disabled={disabled}
        compact
      />
    </div>
  );
}
