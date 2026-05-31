"use client";

import { Match, Phase } from "@/types";
import { getTeamInfo, getAllTeams } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";
import { getBracketRounds, matchesByIdMap } from "@/lib/knockout";
import { countExpectedBracketPicks } from "@/lib/knockout-advancement";
import { getRealKnockoutMatchesForBracket } from "@/lib/predicted-bracket";
import { PHASE_SHORT } from "@/data/phase-labels";
import { BracketLayout } from "@/components/BracketLayout";
import { BracketRoundMatches } from "@/components/BracketRoundMatches";

interface PredictionBracketProps {
  matches: Match[];
  bracketPicks: Record<string, string>;
  onPick: (matchId: string, teamCode: string) => void;
  isPickEnabled?: (phase: Phase) => boolean;
  readOnly?: boolean;
}

export function PredictionBracket({
  matches,
  bracketPicks,
  onPick,
  isPickEnabled,
  readOnly,
}: PredictionBracketProps) {
  const displayMatches = getRealKnockoutMatchesForBracket(matches);
  const byId = matchesByIdMap(displayMatches);
  const rounds = getBracketRounds();
  const pickCount = Object.keys(bracketPicks).length;
  const expectedPicks = countExpectedBracketPicks(matches);
  const incomplete = pickCount > 0 && pickCount < expectedPicks;
  const allTeams = getAllTeams();

  return (
    <div className="min-w-0">
      <BracketLayout
        header={
          <>
            {!readOnly && (
              <p className="text-sm text-pitch-400 mb-4">
                Equips i marcadors oficials del torneig. Tu només tries qui passa de ronda (punts
                d&apos;avancament). Marcadors els prediueu a la pestanya Marcadors.{" "}
                {pickCount > 0 && `${pickCount}/${expectedPicks} tries.`}
              </p>
            )}
            {incomplete && !readOnly && (
              <div className="bg-amber-900/20 border border-amber-700/40 text-amber-100 px-4 py-3 rounded-xl mb-4 text-sm">
                Quadre incomplet: omple totes les rondes per puntuar bé els classificats.
              </div>
            )}
          </>
        }
      >
        {rounds.map((round) => {
          const roundOpen = readOnly || (isPickEnabled?.(round.phase) ?? true);
          return (
            <div key={round.phase} className="bracket-round">
              <div className="bracket-round-title gap-1">
                <span className="leading-tight">{PHASE_SHORT[round.phase] ?? round.name}</span>
                {!roundOpen && !readOnly && <span className="text-xs opacity-70">🔒</span>}
              </div>
              <BracketRoundMatches
                phase={round.phase}
                matchIds={round.matchIds}
                renderMatch={(id) => {
                  const match = byId[id];
                  if (!match) return null;
                  return (
                    <BracketMatchPick
                      key={id}
                      match={match}
                      phase={round.phase}
                      picked={bracketPicks[id]}
                      onPick={(code) => onPick(id, code)}
                      disabled={!roundOpen}
                      allTeams={allTeams}
                    />
                  );
                }}
              />
            </div>
          );
        })}
      </BracketLayout>
    </div>
  );
}

function BracketMatchPick({
  match,
  phase,
  picked,
  onPick,
  disabled,
  allTeams,
}: {
  match: Match;
  phase: Phase;
  picked?: string;
  onPick: (code: string) => void;
  disabled?: boolean;
  allTeams: { code: string; name: string; iso: string }[];
}) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const homeReady = home.code !== "TBD";
  const awayReady = away.code !== "TBD";
  const bothReady = homeReady && awayReady;

  return (
    <div
      className={`bracket-match card-glass rounded-lg sm:rounded-xl p-2 sm:p-2.5 min-w-0 ${
        phase === "final" ? "bracket-match-final" : ""
      } ${picked ? "border border-gold-500/30" : ""}`}
    >
      {bothReady ? (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <PickFlag
              code={home.code}
              name={home.name}
              selected={picked === home.code}
              onClick={() => onPick(home.code)}
              disabled={disabled}
              size={22}
            />
            <span className="text-pitch-500 text-[10px] font-bold shrink-0">vs</span>
            <PickFlag
              code={away.code}
              name={away.name}
              selected={picked === away.code}
              onClick={() => onPick(away.code)}
              disabled={disabled}
              size={22}
            />
          </div>
          {match.homeScore !== undefined && match.awayScore !== undefined && (
            <div className="text-center text-[10px] tabular-nums text-pitch-500">
              Resultat oficial: {match.homeScore}–{match.awayScore}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1 min-w-0">
          {(homeReady || awayReady) && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-pitch-400">
              {homeReady && <TeamFlag code={home.code} size={18} />}
              {homeReady && awayReady && <span className="text-[10px]">vs</span>}
              {awayReady && <TeamFlag code={away.code} size={18} />}
            </div>
          )}
          <select
            value={picked ?? ""}
            onChange={(e) => e.target.value && onPick(e.target.value)}
            disabled={disabled}
            className="w-full max-w-full min-w-0 box-border px-1 py-1.5 bg-pitch-950 border border-pitch-700 rounded-lg text-[10px] sm:text-xs"
            aria-label={`Guanyador ${match.label ?? match.id}`}
          >
            <option value="">— Tria —</option>
            {allTeams.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name}
              </option>
            ))}
          </select>
          {picked && (
            <div className="flex justify-center pt-0.5">
              <TeamFlag code={picked} size={20} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PickFlag({
  code,
  name,
  selected,
  onClick,
  disabled,
  size = 28,
}: {
  code: string;
  name: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={name}
      className={`rounded-md p-1 sm:p-1.5 transition-all shrink-0 ${
        selected
          ? "bg-gold-500/25 ring-2 ring-gold-500"
          : "bg-pitch-950/50 hover:bg-pitch-800/80 opacity-80 hover:opacity-100"
      } ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
    >
      <TeamFlag code={code} size={size} />
    </button>
  );
}
