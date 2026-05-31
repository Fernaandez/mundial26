import { GroupStanding, TeamStanding } from "@/lib/standings";
import { getTeamInfo } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";

interface GroupStandingsTableProps {
  standing: GroupStanding;
  /** Mostra indicador de 3r que passaria com a millor 3r */
  showThirdQualifier?: boolean;
  thirdQualifies?: boolean;
}

export function GroupStandingsTable({
  standing,
  showThirdQualifier = false,
  thirdQualifies = false,
}: GroupStandingsTableProps) {
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
              className="h-full bg-pitch-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-pitch-500">
            {standing.playedMatches}/{standing.totalMatches}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm standings-table min-w-[320px]">
          <thead>
            <tr className="text-pitch-500 text-[10px] sm:text-xs uppercase tracking-wider">
              <th className="text-left py-2 pl-2 sm:pl-3 w-7">#</th>
              <th className="text-left py-2">Equip</th>
              <th className="text-center py-2 w-8">GF</th>
              <th className="text-center py-2 w-8">GC</th>
              <th className="text-center py-2 w-9">DG</th>
              <th className="text-center py-2 w-9 pr-2 sm:pr-3 font-bold text-pitch-300">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standing.teams.map((t) => (
              <StandingRow
                key={t.code}
                team={t}
                showThirdQualifier={showThirdQualifier}
                thirdQualifies={thirdQualifies && t.position === 3}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 border-t border-pitch-800/40 flex flex-wrap gap-3 text-[10px] text-pitch-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pitch-500" /> Classificat (1r-2n)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gold-500" /> Millor 3r
        </span>
      </div>
    </div>
  );
}

function StandingRow({
  team,
  showThirdQualifier,
  thirdQualifies,
}: {
  team: TeamStanding;
  showThirdQualifier?: boolean;
  thirdQualifies?: boolean;
}) {
  const info = getTeamInfo(team.code);
  const isTopTwo = team.position <= 2;
  const isThird = team.position === 3;
  const qualClass = isTopTwo
    ? "standings-row-qualify"
    : isThird && (showThirdQualifier ? thirdQualifies : true)
      ? "standings-row-third"
      : "standings-row-out";

  return (
    <tr className={`standings-row ${qualClass} border-t border-pitch-800/30 transition-colors duration-200`}>
      <td className="py-2 pl-2 sm:pl-3">
        <span
          className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
            isTopTwo
              ? "bg-pitch-600 text-white"
              : isThird && thirdQualifies
                ? "bg-gold-500/30 text-gold-300"
                : isThird
                  ? "bg-gold-500/10 text-gold-500/60"
                  : "bg-pitch-900 text-pitch-500"
          }`}
        >
          {team.position}
        </span>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <TeamFlag code={team.code} size={16} />
          <span className="font-medium text-pitch-100 truncate text-xs sm:text-sm max-w-[72px] sm:max-w-none">
            {info.name}
          </span>
        </div>
      </td>
      <td className="text-center py-2 text-pitch-300 tabular-nums">{team.gf}</td>
      <td className="text-center py-2 text-pitch-300 tabular-nums">{team.ga}</td>
      <td className="text-center py-2 tabular-nums">
        <span className={team.gd > 0 ? "text-pitch-400" : team.gd < 0 ? "text-red-400/80" : "text-pitch-500"}>
          {team.gd > 0 ? `+${team.gd}` : team.gd}
        </span>
      </td>
      <td className="text-center py-2 pr-2 sm:pr-3">
        <span className="font-display text-base sm:text-lg text-white tabular-nums">{team.points}</span>
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
