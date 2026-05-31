"use client";

import { useEffect, useState, useMemo } from "react";
import { Match, Phase } from "@/types";
import { getTeamInfo, PHASE_LABELS } from "@/data/world-cup-2026";
import { MatchFlagsLine } from "@/components/MatchScoreboard";
import { MatchKickoff } from "@/components/MatchKickoff";
import { groupMatchesByDay, phaseLabel } from "@/lib/match-dates";
import { isMatchFinished } from "@/lib/knockout";

type Filter = "all" | Phase;

const PHASE_ORDER: Phase[] = [
  "groups", "round32", "round16", "quarter", "semi", "third", "final",
];

export default function CalendariPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournament")
      .then((r) => r.json())
      .then((data) => setMatches(data.matches ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return matches;
    return matches.filter((m) => m.phase === filter);
  }, [matches, filter]);

  const days = useMemo(() => groupMatchesByDay(filtered), [filtered]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-pitch-400">
        Carregant calendari...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 mb-2">CALENDARI</h1>
      <p className="text-pitch-400 text-sm mb-6">
        Tots els partits del Mundial · hora d&apos;Espanya (peninsular)
      </p>

      <div className="phase-tabs-scroll -mx-3 px-3 sm:mx-0 sm:px-0 mb-8">
        <div className="flex gap-2 min-w-max sm:flex-wrap">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} label="Tots" />
          {PHASE_ORDER.map((p) => (
            <FilterBtn
              key={p}
              active={filter === p}
              onClick={() => setFilter(p)}
              label={PHASE_LABELS[p]}
            />
          ))}
        </div>
      </div>

      {days.length === 0 ? (
        <p className="text-pitch-500 text-center py-12">Cap partit en aquesta fase.</p>
      ) : (
        <div className="space-y-8">
          {days.map(({ day, matches: dayMatches }) => (
            <section key={day}>
              <h2 className="font-display text-xl text-gold-500 mb-3 capitalize">{day}</h2>
              <div className="space-y-2">
                {dayMatches.map((m) => (
                  <CalendarRow key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
        active ? "tab-active" : "tab-inactive"
      }`}
    >
      {label}
    </button>
  );
}

function CalendarRow({ match }: { match: Match }) {
  const home = getTeamInfo(match.homeTeam);
  const away = getTeamInfo(match.awayTeam);
  const finished = isMatchFinished(match);
  const phase = phaseLabel(match.phase);

  return (
    <div
      className={`card-glass rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
        finished ? "border border-gold-500/20" : ""
      }`}
    >
      <div className="sm:w-44 shrink-0 text-center sm:text-left">
        <MatchKickoff match={match} compact />
      </div>
      <div className="flex-1 min-w-0 text-center">
        <div className="text-[10px] uppercase tracking-wider text-pitch-500 mb-2">
          {match.groupId ? `Grup ${match.groupId}` : phase}
          {match.label && match.groupId === undefined && ` · ${match.label}`}
        </div>
        <MatchFlagsLine
          homeCode={home.code}
          awayCode={away.code}
          homeName={home.name}
          awayName={away.name}
          homeScore={finished ? match.homeScore : undefined}
          awayScore={finished ? match.awayScore : undefined}
          compact
        />
      </div>
    </div>
  );
}
