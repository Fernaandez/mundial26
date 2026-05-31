import { Match } from "@/types";
import { getTeamInfo } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";
import { getMatchWinner, isMatchFinished } from "@/lib/knockout";

interface MatchScoreboardProps {
  match: Match;
  variant?: "card" | "bracket" | "compact";
  prediction?: { home: number; away: number };
  showPrediction?: boolean;
}

export function MatchScoreboard({
  match,
  variant = "card",
  prediction,
  showPrediction = false,
}: MatchScoreboardProps) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const finished = isMatchFinished(match);
  const winner = getMatchWinner(match);
  const homeWin = winner === home.code;
  const awayWin = winner === away.code;

  const isBracket = variant === "bracket";
  const isCompact = variant === "compact";

  return (
    <div className={isBracket ? "bracket-match-inner" : ""}>
      {match.label && isBracket && (
        <div className="text-[10px] text-pitch-500 uppercase tracking-wider mb-1.5 truncate">
          {match.label}
        </div>
      )}

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

      {showPrediction && prediction && finished && (
        <div className="text-center text-[10px] text-pitch-500 mt-1.5 border-t border-pitch-800/50 pt-1.5">
          Predicció: {prediction.home} - {prediction.away}
        </div>
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
  const flagSize = compact ? 18 : large ? 32 : 22;

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
