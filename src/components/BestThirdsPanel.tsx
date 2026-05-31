import { BestThirdEntry } from "@/lib/standings";
import { getTeamInfo } from "@/data/world-cup-2026";
import { TeamFlag } from "@/components/TeamFlag";
import { SCORING_RULES } from "@/data/world-cup-2026";

interface BestThirdsPanelProps {
  entries: BestThirdEntry[];
  variant?: "prediction" | "results";
}

export function BestThirdsPanel({ entries, variant = "prediction" }: BestThirdsPanelProps) {
  const completeCount = entries.filter((e) => e.groupComplete).length;
  const qualifiers = entries.filter((e) => e.qualifies);
  const pts = SCORING_RULES.special.nonQualifyingThird;

  if (entries.length === 0) {
    return (
      <div className="card-glass rounded-2xl p-5 sm:p-6 mb-6 border border-pitch-700/40">
        <h3 className="font-display text-xl sm:text-2xl text-gold-500 mb-2">8 MILLORS 3RS</h3>
        <p className="text-sm text-pitch-400">
          {variant === "prediction"
            ? "Omple marcadors de grups per veure quins 3rs passarien d'eliminatoria."
            : "Encara no hi ha prou resultats de grups per calcular els millors 3rs."}
        </p>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-2xl p-4 sm:p-6 mb-6 border border-gold-500/20">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-xl sm:text-2xl text-gold-500">8 MILLORS 3RS CLASSIFICATS</h3>
          <p className="text-sm text-pitch-400 mt-1">
            {variant === "prediction"
              ? "Calculat dels teus marcadors · els 8 primers passen als setzens"
              : "Calculat dels resultats oficials · els 8 primers passen als setzens"}
          </p>
        </div>
        <div className="text-right text-xs text-pitch-500">
          <div>{qualifiers.length}/8 places</div>
          {variant === "prediction" && completeCount < 12 && (
            <div className="text-gold-500/80 mt-0.5">{completeCount}/12 grups complets</div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-pitch-500 text-[10px] sm:text-xs uppercase tracking-wider border-b border-pitch-800/60">
              <th className="text-left py-2 w-8">#</th>
              <th className="text-left py-2">Equip (3r del grup)</th>
              <th className="text-left py-2">Grup</th>
              <th className="text-center py-2 w-10">Pts</th>
              <th className="text-center py-2 w-10">DG</th>
              <th className="text-center py-2 w-10">GF</th>
              <th className="text-center py-2 w-16">Passa</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <BestThirdRow key={e.groupId} entry={e} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-pitch-500 mt-4 border-t border-pitch-800/40 pt-3">
        Puntuació: <strong className="text-pitch-300">{pts} pts</strong> si encertes un 3r que
        queda fora dels 8 millors 3rs classificats (predicció a pestanya Mundial).
      </p>
    </div>
  );
}

function BestThirdRow({ entry }: { entry: BestThirdEntry }) {
  const info = getTeamInfo(entry.team.code);
  const rowClass = entry.qualifies
    ? "bg-gold-500/10 border-gold-500/20"
    : "border-pitch-800/30 opacity-70";

  return (
    <tr className={`border-t ${rowClass}`}>
      <td className="py-2.5">
        <span
          className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
            entry.qualifies ? "bg-gold-500/30 text-gold-300" : "bg-pitch-900 text-pitch-500"
          }`}
        >
          {entry.rank}
        </span>
      </td>
      <td className="py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag code={entry.team.code} size={18} />
          <span className="font-medium text-pitch-100 truncate">{info.name}</span>
          {!entry.groupComplete && (
            <span className="text-[10px] text-pitch-500 shrink-0">(incomplet)</span>
          )}
        </div>
      </td>
      <td className="py-2.5 text-pitch-400">{entry.groupName}</td>
      <td className="py-2.5 text-center tabular-nums font-display text-white">{entry.team.points}</td>
      <td className="py-2.5 text-center tabular-nums text-pitch-300">
        {entry.team.gd > 0 ? `+${entry.team.gd}` : entry.team.gd}
      </td>
      <td className="py-2.5 text-center tabular-nums text-pitch-300">{entry.team.gf}</td>
      <td className="py-2.5 text-center">
        {!entry.groupComplete ? (
          <span className="text-pitch-500 text-xs">—</span>
        ) : entry.qualifies ? (
          <span className="text-gold-400 font-semibold text-xs">✓ Sí</span>
        ) : (
          <span className="text-pitch-500 text-xs">No</span>
        )}
      </td>
    </tr>
  );
}
