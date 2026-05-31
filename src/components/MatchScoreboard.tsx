import { Match } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";
import { MatchKickoff } from "@/components/MatchKickoff";
import { getMatchWinner, isMatchFinished, hasExtraTimeResult } from "@/lib/knockout";

interface MatchScoreboardProps {
  match: Match;
  variant?: "card" | "bracket" | "compact";
  prediction?: { home: number; away: number };
  showPrediction?: boolean;
  showKickoff?: boolean;
}

export function MatchScoreboard({
  match,
  variant = "card",
  prediction,
  showPrediction = false,
  showKickoff = true,
}: MatchScoreboardProps) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const finished = isMatchFinished(match);
  const winner = getMatchWinner(match);
  const homeWin = winner === home.code;
  const awayWin = winner === away.code;
  const drawAdvance =
    finished &&
    match.homeScore === match.awayScore &&
    !!match.knockoutWinner &&
    !hasExtraTimeResult(match);
  const showEtLine =
    finished &&
    hasExtraTimeResult(match) &&
    (match.etHomeScore !== match.homeScore || match.etAwayScore !== match.awayScore);

  const isBracket = variant === "bracket";
  const isCompact = variant === "compact";
  const useInline = finished && !isBracket;

  return (
    <div className={isBracket ? "bracket-match-inner" : ""}>
      {match.label && isBracket && (
        <div className="text-[10px] text-pitch-500 uppercase tracking-wider mb-1.5 truncate">
          {match.label}
        </div>
      )}
      {!isBracket && showKickoff && (
        <MatchKickoff match={match} className="mb-2" compact={isCompact} />
      )}

      {useInline ? (
        <InlineScoreLine
          home={home}
          away={away}
          homeScore={match.homeScore!}
          awayScore={match.awayScore!}
          homeWin={homeWin}
          awayWin={awayWin}
          compact={isCompact}
        />
      ) : (
        <>
          <TeamLine
            code={home.code}
            name={home.name}
            score={finished ? match.homeScore : undefined}
            predScore={showPrediction ? prediction?.home : undefined}
            isWinner={homeWin}
            isLoser={finished && awayWin}
            align={isBracket ? "left" : "right"}
            compact={isCompact}
            large={variant === "card" && finished}
          />

          {finished ? (
            <div
              className={`text-center font-display text-pitch-500 ${
                isCompact ? "text-xs py-0.5" : isBracket ? "text-sm py-1" : "text-lg py-1"
              }`}
            >
              {isBracket ? "·" : "VS"}
            </div>
          ) : (
            <div
              className={`text-center text-pitch-600 font-bold ${
                isCompact ? "text-xs py-0.5" : isBracket ? "text-xs py-1" : "text-sm py-1"
              }`}
            >
              vs
            </div>
          )}

          <TeamLine
            code={away.code}
            name={away.name}
            score={finished ? match.awayScore : undefined}
            predScore={showPrediction ? prediction?.away : undefined}
            isWinner={awayWin}
            isLoser={finished && homeWin}
            align="left"
            compact={isCompact}
            large={variant === "card" && finished}
          />
        </>
      )}

      {showEtLine && (
        <p className="text-[10px] text-pitch-400 text-center mt-1.5">
          90 min: {match.homeScore}-{match.awayScore} · Final: {match.etHomeScore}-{match.etAwayScore}
        </p>
      )}

      {drawAdvance && (
        <p className="text-[10px] text-gold-400 text-center mt-1.5">
          Passa: {getTeamInfo(match.knockoutWinner!).name}
        </p>
      )}

      {showPrediction && prediction && finished && (
        <div className="text-center text-[10px] text-pitch-500 mt-1.5 border-t border-pitch-800/50 pt-1.5">
          Predicció: {prediction.home} vs {prediction.away}
        </div>
      )}
    </div>
  );
}

/** Bandera + resultat centrat (calendari, llistes…) */
export function MatchFlagsLine({
  homeCode,
  awayCode,
  homeName,
  awayName,
  homeScore,
  awayScore,
  compact = false,
}: {
  homeCode: string;
  awayCode: string;
  homeName: string;
  awayName: string;
  homeScore?: number;
  awayScore?: number;
  compact?: boolean;
}) {
  const flagSize = compact ? 22 : 26;
  const finished = homeScore !== undefined && awayScore !== undefined;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <span title={homeName}><TeamFlag code={homeCode} size={flagSize} /></span>
      {finished ? (
        <>
          <span className="font-display text-lg sm:text-xl text-gold-400 tabular-nums">{homeScore}</span>
          <span className="text-pitch-500 text-sm font-bold">vs</span>
          <span className="font-display text-lg sm:text-xl text-gold-400 tabular-nums">{awayScore}</span>
        </>
      ) : (
        <span className="text-pitch-500 text-sm font-bold">vs</span>
      )}
      <span title={awayName}><TeamFlag code={awayCode} size={flagSize} /></span>
    </div>
  );
}

function InlineScoreLine({
  home,
  away,
  homeScore,
  awayScore,
  homeWin,
  awayWin,
  compact,
}: {
  home: { code: string; name: string };
  away: { code: string; name: string };
  homeScore: number;
  awayScore: number;
  homeWin: boolean;
  awayWin: boolean;
  compact?: boolean;
}) {
  const flagSize = compact ? 22 : 28;
  const scoreClass = compact
    ? "font-display text-lg text-gold-400 tabular-nums"
    : "font-display text-xl sm:text-2xl text-gold-400 tabular-nums";

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <FlagScore
        code={home.code}
        name={home.name}
        score={homeScore}
        isWinner={homeWin}
        isLoser={awayWin}
        flagSize={flagSize}
        scoreClass={scoreClass}
        side="home"
      />
      <span className="text-pitch-500 font-bold text-xs sm:text-sm shrink-0">vs</span>
      <FlagScore
        code={away.code}
        name={away.name}
        score={awayScore}
        isWinner={awayWin}
        isLoser={homeWin}
        flagSize={flagSize}
        scoreClass={scoreClass}
        side="away"
      />
    </div>
  );
}

function FlagScore({
  code,
  name,
  score,
  isWinner,
  isLoser,
  flagSize,
  scoreClass,
  side = "home",
}: {
  code: string;
  name: string;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  flagSize: number;
  scoreClass: string;
  side?: "home" | "away";
}) {
  const isTbd = code === "TBD";

  const flag = !isTbd ? (
    <TeamFlag code={code} size={flagSize} />
  ) : (
    <span
      className="inline-flex items-center justify-center rounded bg-pitch-800 text-pitch-500 text-[10px] shrink-0"
      style={{ width: flagSize, height: Math.round(flagSize * 0.75) }}
    >
      ?
    </span>
  );

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 ${
        isWinner ? "text-gold-300" : isLoser ? "opacity-55" : ""
      }`}
      title={isTbd ? "Per definir" : name}
    >
      {side === "home" ? (
        <>
          {flag}
          <span className={scoreClass}>{score}</span>
        </>
      ) : (
        <>
          <span className={scoreClass}>{score}</span>
          {flag}
        </>
      )}
    </div>
  );
}

function TeamLine({
  code,
  name,
  score,
  predScore,
  isWinner,
  isLoser,
  align,
  compact,
  large,
}: {
  code: string;
  name: string;
  score?: number;
  predScore?: number;
  isWinner?: boolean;
  isLoser?: boolean;
  align: "left" | "right";
  compact?: boolean;
  large?: boolean;
}) {
  const isTbd = code === "TBD";
  const flagSize = compact ? 18 : large ? 28 : 22;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
        isWinner
          ? "bg-gold-500/15 border border-gold-500/40"
          : isLoser
            ? "opacity-55"
            : "bg-pitch-950/40"
      } ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      {!isTbd ? (
        <TeamFlag code={code} size={flagSize} />
      ) : (
        <span
          className="inline-flex items-center justify-center rounded bg-pitch-800 text-pitch-500 text-xs shrink-0"
          style={{ width: flagSize, height: Math.round(flagSize * 0.75) }}
        >
          ?
        </span>
      )}
      <span
        className={`flex-1 min-w-0 truncate font-medium ${
          compact ? "text-xs" : large ? "text-base" : "text-sm"
        } ${isWinner ? "text-gold-300" : isTbd ? "text-pitch-500 italic" : "text-pitch-100"}`}
      >
        {isTbd ? "Per definir" : name}
      </span>
      {score !== undefined && (
        <span
          className={`font-display shrink-0 ${
            large ? "text-3xl text-gold-400" : compact ? "text-sm" : "text-xl text-white"
          } ${isWinner ? "text-gold-400" : ""}`}
        >
          {score}
        </span>
      )}
      {score === undefined && predScore !== undefined && (
        <span className="font-display text-sm text-pitch-400 shrink-0">{predScore}</span>
      )}
    </div>
  );
}
