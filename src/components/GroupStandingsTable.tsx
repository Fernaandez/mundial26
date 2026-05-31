import { GroupStanding, TeamStanding } from "@/lib/standings";
import { getTeamInfo } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";

interface GroupStandingsTableProps {
  standing: GroupStanding;
  compact?: boolean;
}

export function GroupStandingsTable({ standing, compact = false }: GroupStandingsTableProps) {
  const progress = standing.totalMatches
    ? Math.round((standing.playedMatches / standing.totalMatches) * 100)
    : 0;

  return (
    <div className="standings-card card-glass rounded-xl overflow-hidden">
      <div className="standings-header px-3 py-2.5 sm:px-4 flex items-center justify-between gap-2 border-b border-pitch-800/60">
        <h3 className="font-display text-lg sm:text-xl text-pitch-300">{standing.groupName}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block w-20 h-1.5 bg-pitch-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-pitch-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-pitch-500">
            {standing.playedMatches}/{standing.totalMatches}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm standings-table">
          <thead>
            <tr className="text-pitch-500 text-xs uppercase tracking-wider">
              <th className="text-left py-2 pl-3 sm:pl-4 w-8">#</th>
              <th className="text-left py-2">Equip</th>
              {!compact && <th className="text-center py-2 w-8">PJ</th>}
              {!compact && <th className="text-center py-2 w-8 hidden sm:table-cell">G</th>}
              {!compact && <th className="text-center py-2 w-8 hidden sm:table-cell">E</th>}
              {!compact && <th className="text-center py-2 w-8 hidden sm:table-cell">P</th>}
              <th className="text-center py-2 w-10 hidden md:table-cell">DG</th>
              <th className="text-center py-2 w-12 pr-3 sm:pr-4 font-bold text-pitch-300">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standing.teams.map((t) => (
              <StandingRow key={t.code} team={t} compact={compact} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 border-t border-pitch-800/40 flex flex-wrap gap-3 text-[10px] text-pitch-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pitch-500" /> Classificat
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gold-500" /> Possible 3r
        </span>
      </div>
    </div>
  );
}

function StandingRow({ team, compact }: { team: TeamStanding; compact?: boolean }) {
  const info = getTeamInfo(team.code);
  const qualClass =
    team.position === 1 || team.position === 2
      ? "standings-row-qualify"
      : team.position === 3
        ? "standings-row-third"
        : "standings-row-out";

  return (
    <tr className={`standings-row ${qualClass} border-t border-pitch-800/30`}>
      <td className="py-2 pl-3 sm:pl-4">
        <span
          className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
            team.position <= 2
              ? "bg-pitch-600 text-white"
              : team.position === 3
                ? "bg-gold-500/20 text-gold-400"
                : "bg-pitch-900 text-pitch-500"
          }`}
        >
          {team.position}
        </span>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag code={team.code} size={compact ? 16 : 20} />
          <span className="font-medium text-pitch-100 truncate max-w-[100px] sm:max-w-none">
            {info.name}
          </span>
        </div>
      </td>
      {!compact && <td className="text-center py-2 text-pitch-400">{team.played}</td>}
      {!compact && <td className="text-center py-2 text-pitch-400 hidden sm:table-cell">{team.won}</td>}
      {!compact && <td className="text-center py-2 text-pitch-400 hidden sm:table-cell">{team.drawn}</td>}
      {!compact && <td className="text-center py-2 text-pitch-400 hidden sm:table-cell">{team.lost}</td>}
      <td className="text-center py-2 hidden md:table-cell">
        <span className={team.gd > 0 ? "text-pitch-400" : team.gd < 0 ? "text-red-400/80" : "text-pitch-500"}>
          {team.gd > 0 ? `+${team.gd}` : team.gd}
        </span>
      </td>
      <td className="text-center py-2 pr-3 sm:pr-4">
        <span className="font-display text-lg text-white">{team.points}</span>
      </td>
    </tr>
  );
}

interface AllGroupStandingsProps {
  standings: GroupStanding[];
}

export function AllGroupStandingsGrid({ standings }: AllGroupStandingsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {standings.map((s) => (
        <GroupStandingsTable key={s.groupId} standing={s} />
      ))}
    </div>
  );
}
