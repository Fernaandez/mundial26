"use client";

import { Match, Phase } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { getBracketRounds, matchesByIdMap } from "@/lib/knockout";
import { getBracketCascadeClearIds } from "@/lib/bracket-tree";
import {
  buildSimulatedKnockoutMatches,
  bothTeamsReady,
  countFilledBracketPicks,
  expectedSimulatedBracketPicks,
  isRound32DrawComplete,
} from "@/lib/predicted-bracket";
import {
  bracketPickPointsForPhase,
  evaluateBracketPick,
  summarizeBracketPickScore,
} from "@/lib/bracket-scoring";
import { PHASE_SHORT, BRACKET_ROUND_HINTS } from "@/data/phase-labels";
import { BracketLayout } from "@/components/BracketLayout";
import { BracketRoundMatches } from "@/components/BracketRoundMatches";
import { TeamFlag } from "@/components/TeamFlag";

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
  const r32Ready = isRound32DrawComplete(matches);
  const simulated = buildSimulatedKnockoutMatches(matches, bracketPicks);
  const realById = matchesByIdMap(matches);
  const byId = matchesByIdMap(simulated);
  const rounds = getBracketRounds();
  const pickCount = countFilledBracketPicks(simulated, bracketPicks);
  const expectedPicks = expectedSimulatedBracketPicks(simulated);
  const incomplete = pickCount > 0 && pickCount < expectedPicks;
  const scoreSummary = summarizeBracketPickScore(matches, bracketPicks);
  const showScoreFeedback =
    scoreSummary.correctPicks + scoreSummary.wrongPicks > 0;

  return (
    <div className="min-w-0">
      <BracketLayout
        header={
          <>
            {!readOnly && !r32Ready && (
              <div className="bg-pitch-800/40 border border-pitch-600/40 text-pitch-200 px-4 py-3 rounded-xl mb-4 text-sm">
                El quadre s&apos;obrirà quan l&apos;admin assigni els 16 partits de setzens (1/16)
                amb tots els equips definits.
              </div>
            )}
            {!readOnly && r32Ready && (
              <p className="text-sm text-pitch-400 mb-4">
                Simula tota l&apos;eliminatòria a partir del sorteig real de setzens. Tria qui passa
                a cada enfrontament — la teva predicció es propaga a vuitens, quarts, semis, 3r i
                final (punts d&apos;avancament). Marcadors del torneig real es posen a{" "}
                <strong className="text-pitch-200">Marcadors</strong>.{" "}
                {pickCount > 0 && `${pickCount}/${expectedPicks} tries.`}
              </p>
            )}
            {incomplete && !readOnly && (
              <div className="bg-amber-900/20 border border-amber-700/40 text-amber-100 px-4 py-3 rounded-xl mb-4 text-sm">
                Quadre incomplet: omple totes les rondes per puntuar bé els classificats.
              </div>
            )}
            {showScoreFeedback && (
              <div className="bg-pitch-950/60 border border-pitch-700/50 rounded-xl px-4 py-3 mb-4 text-sm">
                <p className="text-pitch-200">
                  Punts del quadre:{" "}
                  <strong className="text-gold-400 tabular-nums">{scoreSummary.totalPoints}</strong>
                  {" · "}
                  <span className="text-emerald-400">{scoreSummary.correctPicks} encerts</span>
                  {scoreSummary.wrongPicks > 0 && (
                    <>
                      {" · "}
                      <span className="text-red-400">{scoreSummary.wrongPicks} errors</span>
                    </>
                  )}
                </p>
                <p className="text-pitch-500 text-xs mt-1">
                  Contorn verd = encert (+ punts de la ronda); vermell = error. Setzens 1 pt · Vuitens 5
                  · Quarts 10 · 3r 10 · Campió 20.
                </p>
              </div>
            )}
          </>
        }
      >
        {rounds.map((round) => {
          const roundOpen = readOnly || (isPickEnabled?.(round.phase) ?? true);
          const phasePts = scoreSummary.byPhase[round.phase];
          const phasePoints = bracketPickPointsForPhase(round.phase);
          return (
            <div key={round.phase} className="bracket-round">
              <div className="bracket-round-title flex-col gap-0.5">
                <span className="leading-tight">{PHASE_SHORT[round.phase] ?? round.name}</span>
                {BRACKET_ROUND_HINTS[round.phase] && (
                  <span className="text-[9px] sm:text-[10px] font-normal text-pitch-500 normal-case tracking-normal leading-tight">
                    {BRACKET_ROUND_HINTS[round.phase]}
                    {phasePoints > 0 ? ` · +${phasePoints} pt/encert` : ""}
                  </span>
                )}
                {phasePts && phasePts.correct > 0 && (
                  <span className="text-[9px] sm:text-[10px] font-normal text-emerald-400/90 normal-case tracking-normal">
                    +{phasePts.points} pts ({phasePts.correct} encerts)
                  </span>
                )}
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
                      realMatch={realById[id] ?? match}
                      phase={round.phase}
                      picked={bracketPicks[id]}
                      onPick={(code) => onPick(id, code)}
                      disabled={!roundOpen || !bothTeamsReady(match)}
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
  realMatch,
  phase,
  picked,
  onPick,
  disabled,
}: {
  match: Match;
  realMatch: Match;
  phase: Phase;
  picked?: string;
  onPick: (code: string) => void;
  disabled?: boolean;
}) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const ready = bothTeamsReady(match);
  const evaluation = evaluateBracketPick(realMatch, picked);
  const showResult = evaluation.state === "correct" || evaluation.state === "wrong";

  const matchBorder =
    evaluation.state === "correct"
      ? "border-2 border-emerald-500/80 ring-1 ring-emerald-500/30"
      : evaluation.state === "wrong"
        ? "border-2 border-red-500/80 ring-1 ring-red-500/30"
        : picked
          ? "border border-gold-500/30"
          : "";

  return (
    <div
      className={`bracket-match card-glass rounded-lg sm:rounded-xl p-2 sm:p-2.5 min-w-0 ${matchBorder} ${
        phase === "final" ? "bracket-match-final" : ""
      } ${!ready ? "opacity-45" : ""}`}
    >
      {ready ? (
        <>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <PickFlag
              code={home.code}
              name={home.name}
              selected={picked === home.code}
              resultState={flagResultState(home.code, picked, evaluation)}
              onClick={() => onPick(home.code)}
              disabled={disabled}
              size={22}
            />
            <span className="text-pitch-500 text-[10px] font-bold shrink-0">vs</span>
            <PickFlag
              code={away.code}
              name={away.name}
              selected={picked === away.code}
              resultState={flagResultState(away.code, picked, evaluation)}
              onClick={() => onPick(away.code)}
              disabled={disabled}
              size={22}
            />
          </div>
          {showResult && (
            <div
              className={`text-center text-[10px] mt-1.5 font-medium tabular-nums ${
                evaluation.state === "correct" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {evaluation.state === "correct"
                ? evaluation.points > 0
                  ? `+${evaluation.points} pt${evaluation.points === 1 ? "" : "s"}`
                  : "✓ Encert"
                : "✗ Error"}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-[10px] text-pitch-500 py-2">Per definir</div>
      )}
    </div>
  );
}

function flagResultState(
  code: string,
  picked: string | undefined,
  evaluation: ReturnType<typeof evaluateBracketPick>
): "neutral" | "correct" | "wrong" | "actual" {
  if (evaluation.state === "pending" || evaluation.state === "unset") return "neutral";
  if (code === picked) {
    return evaluation.state === "correct" ? "correct" : "wrong";
  }
  if (evaluation.actualWinner === code) return "actual";
  return "neutral";
}

function PickFlag({
  code,
  name,
  selected,
  resultState,
  onClick,
  disabled,
  size = 28,
}: {
  code: string;
  name: string;
  selected: boolean;
  resultState: "neutral" | "correct" | "wrong" | "actual";
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}) {
  const resultRing =
    resultState === "correct"
      ? "ring-2 ring-emerald-500 bg-emerald-500/20"
      : resultState === "wrong"
        ? "ring-2 ring-red-500 bg-red-500/20"
        : resultState === "actual"
          ? "ring-2 ring-emerald-500/50 bg-emerald-500/10"
          : selected
            ? "bg-gold-500/25 ring-2 ring-gold-500"
            : "bg-pitch-950/50 hover:bg-pitch-800/80 opacity-80 hover:opacity-100";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={name}
      className={`rounded-md p-1 sm:p-1.5 transition-all shrink-0 ${resultRing} ${
        disabled ? "cursor-default opacity-60" : "cursor-pointer"
      }`}
    >
      <TeamFlag code={code} size={size} />
    </button>
  );
}

/** Neteja tries avalsallades quan canvia un guanyador upstream */
export function applyBracketPickWithCascade(
  bracketPicks: Record<string, string>,
  matchId: string,
  teamCode: string
): Record<string, string> {
  const next = { ...bracketPicks, [matchId]: teamCode };
  for (const id of getBracketCascadeClearIds(matchId)) {
    delete next[id];
  }
  return next;
}
