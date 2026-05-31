"use client";

import { Match, Phase } from "@/types";
import { getTeamInfo, getAllTeams } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";
import { getBracketRounds, matchesByIdMap } from "@/lib/knockout";
import { countExpectedBracketPicks } from "@/lib/knockout-advancement";
import { enrichKnockoutDisplayTeams } from "@/lib/predicted-bracket";

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
  const displayMatches = enrichKnockoutDisplayTeams(matches, bracketPicks);
  const byId = matchesByIdMap(displayMatches);
  const rounds = getBracketRounds();
  const pickCount = Object.keys(bracketPicks).length;
  const expectedPicks = countExpectedBracketPicks(matches);
  const incomplete = pickCount > 0 && pickCount < expectedPicks;
  const allTeams = getAllTeams();

  return (
    <div>
      {!readOnly && (
        <p className="text-sm text-pitch-400 mb-4">
          Clica la bandera de qui passa de ronda. A <strong className="text-pitch-200">Setzens</strong>,
          tria el guanyador de cada partit (desplaça&apos;t cap a l&apos;esquerra si no el veus).
          El quadre sencer es pot omplir durant la finestra de Setzens.{" "}
          {pickCount > 0 && `${pickCount}/${expectedPicks} tries.`}
        </p>
      )}
      {incomplete && !readOnly && (
        <div className="bg-amber-900/20 border border-amber-700/40 text-amber-100 px-4 py-3 rounded-xl mb-4 text-sm">
          Quadre incomplet: omple totes les rondes per puntuar bé els classificats.
        </div>
      )}

      <div className="bracket-scroll">
        {rounds.map((round) => {
          const roundOpen = readOnly || (isPickEnabled?.(round.phase) ?? true);
          return (
            <div key={round.phase} className="bracket-round">
              <div className="bracket-round-title flex items-center justify-center gap-2">
                {round.name}
                {!roundOpen && !readOnly && <span className="text-xs opacity-70">🔒</span>}
              </div>
              <div className="bracket-round-matches">
                {round.matchIds.map((id) => {
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
                })}
              </div>
            </div>
          );
        })}
      </div>
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
      className={`bracket-match card-glass rounded-xl p-3 ${
        phase === "final" ? "bracket-match-final" : ""
      } ${picked ? "border border-gold-500/30" : ""}`}
    >
      {match.label && (
        <div className="text-[10px] text-pitch-500 uppercase tracking-wider mb-2 truncate">
          {match.label}
        </div>
      )}

      {bothReady ? (
        <div className="flex items-center justify-center gap-2">
          <PickFlag
            code={home.code}
            name={home.name}
            selected={picked === home.code}
            onClick={() => onPick(home.code)}
            disabled={disabled}
          />
          <span className="text-pitch-500 text-xs font-bold shrink-0">vs</span>
          <PickFlag
            code={away.code}
            name={away.name}
            selected={picked === away.code}
            onClick={() => onPick(away.code)}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {(homeReady || awayReady) && (
            <div className="flex items-center justify-center gap-2 text-xs text-pitch-400">
              {homeReady && <TeamFlag code={home.code} size={20} />}
              {homeReady && awayReady && <span>vs</span>}
              {awayReady && <TeamFlag code={away.code} size={20} />}
            </div>
          )}
          <label className="block text-[10px] text-pitch-500 text-center">Guanyador</label>
          <select
            value={picked ?? ""}
            onChange={(e) => e.target.value && onPick(e.target.value)}
            disabled={disabled}
            className="w-full px-2 py-2 bg-pitch-950 border border-pitch-700 rounded-lg text-xs"
          >
            <option value="">— Tria equip —</option>
            {allTeams.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name}
              </option>
            ))}
          </select>
          {picked && (
            <div className="flex justify-center pt-1">
              <TeamFlag code={picked} size={24} />
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
}: {
  code: string;
  name: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={name}
      className={`rounded-lg p-2 transition-all ${
        selected
          ? "bg-gold-500/25 ring-2 ring-gold-500 scale-105"
          : "bg-pitch-950/50 hover:bg-pitch-800/80 opacity-80 hover:opacity-100"
      } ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
    >
      <TeamFlag code={code} size={28} />
    </button>
  );
}
