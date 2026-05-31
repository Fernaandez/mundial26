import { Match } from "@/types";
import { formatMatchKickoff } from "@/lib/match-dates";

interface MatchKickoffProps {
  match: Match;
  className?: string;
  compact?: boolean;
}

export function MatchKickoff({ match, className = "", compact = false }: MatchKickoffProps) {
  const kickoff = formatMatchKickoff(match.date);
  if (!kickoff) return null;

  if (compact) {
    return (
      <div className={`text-xs text-pitch-400 ${className}`}>
        {kickoff.full}
        {match.city && <span className="text-pitch-500"> · {match.city}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-pitch-400 ${className}`}>
      <span className="text-pitch-300">{kickoff.full}</span>
      {match.city && (
        <span className="text-pitch-500">📍 {match.city}</span>
      )}
    </div>
  );
}
