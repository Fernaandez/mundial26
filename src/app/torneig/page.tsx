"use client";

import { useEffect, useState, useCallback } from "react";
import { Match } from "@/types";
import { GroupStanding } from "@/lib/standings";
import { AllGroupStandingsGrid } from "@/components/GroupStandingsTable";
import { KnockoutBracket, KnockoutPhaseList } from "@/components/KnockoutBracket";
import { Phase } from "@/types";
import { PHASE_LABELS } from "@/data/world-cup-2026";

type Tab = "groups" | "knockout";

interface TournamentData {
  matches: Match[];
  groupStandings: GroupStanding[];
  stats: {
    groupResultsCount: number;
    groupMatchesTotal: number;
    knockoutResultsCount: number;
    knockoutMatchesTotal: number;
  };
  updatedAt: string;
}

const KNOCKOUT_TABS: Phase[] = ["round32", "round16", "quarter", "semi", "third", "final"];

export default function TorneigPage() {
  const [tab, setTab] = useState<Tab>("groups");
  const [knockoutView, setKnockoutView] = useState<"bracket" | "list">("bracket");
  const [knockoutPhase, setKnockoutPhase] = useState<Phase>("round32");
  const [data, setData] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-pitch-400">
        Carregant torneig...
      </div>
    );
  }

  const secondsAgo = lastRefresh
    ? Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-pitch-400">TORNEIG</h1>
          <p className="text-pitch-400 text-sm mt-1">
            Resultats i classificacions en directe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" aria-hidden />
          <span className="text-xs text-pitch-500">
            Actualitzat fa {secondsAgo}s · cada 15s
          </span>
          <button type="button" onClick={load} className="btn-secondary text-xs py-2 px-3">
            ↻
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatPill
          label="Grups"
          value={`${data.stats.groupResultsCount}/${data.stats.groupMatchesTotal}`}
          sub="partits amb resultat"
        />
        <StatPill
          label="Eliminatòries"
          value={`${data.stats.knockoutResultsCount}/${data.stats.knockoutMatchesTotal}`}
          sub="partits amb resultat"
        />
        <StatPill label="Grups" value="12" sub="classificacions" />
        <StatPill label="Format" value="48" sub="equips" />
      </div>

      {/* Main tabs */}
      <div className="grid grid-cols-2 gap-2 mb-8 max-w-lg">
        <button
          type="button"
          onClick={() => setTab("groups")}
          className={`p-4 rounded-xl text-left ${tab === "groups" ? "tab-active" : "tab-inactive"}`}
        >
          <div className="font-display text-xl">Fase de grups</div>
          <div className="text-xs opacity-80 mt-1">Classificacions en viu</div>
        </button>
        <button
          type="button"
          onClick={() => setTab("knockout")}
          className={`p-4 rounded-xl text-left ${tab === "knockout" ? "tab-active" : "tab-inactive"}`}
        >
          <div className="font-display text-xl">Eliminatòries</div>
          <div className="text-xs opacity-80 mt-1">Quadre del torneig</div>
        </button>
      </div>

      {tab === "groups" && (
        <section>
          <p className="text-sm text-pitch-400 mb-6">
            Les taules s&apos;actualitzen automàticament quan l&apos;admin introdueix resultats.
            <span className="text-pitch-500"> Verd = classificat · Groc = possible 3r</span>
          </p>
          <AllGroupStandingsGrid standings={data.groupStandings} />
        </section>
      )}

      {tab === "knockout" && (
        <section>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setKnockoutView("bracket")}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                knockoutView === "bracket" ? "tab-active" : "tab-inactive"
              }`}
            >
              Quadre complet
            </button>
            <button
              type="button"
              onClick={() => setKnockoutView("list")}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                knockoutView === "list" ? "tab-active" : "tab-inactive"
              }`}
            >
              Per fase
            </button>
          </div>

          {knockoutView === "bracket" ? (
            <KnockoutBracket matches={data.matches} />
          ) : (
            <>
              <div className="phase-tabs-scroll -mx-3 px-3 sm:mx-0 sm:px-0 mb-6">
                <div className="flex gap-2 min-w-max">
                  {KNOCKOUT_TABS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setKnockoutPhase(p)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                        knockoutPhase === p ? "tab-active" : "tab-inactive"
                      }`}
                    >
                      {PHASE_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <h2 className="font-display text-2xl text-pitch-400 mb-4">
                {PHASE_LABELS[knockoutPhase]}
              </h2>
              <KnockoutPhaseList matches={data.matches} phase={knockoutPhase} />
            </>
          )}
        </section>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card-glass rounded-xl p-3 sm:p-4 text-center">
      <div className="text-xs text-pitch-500 uppercase tracking-wider">{label}</div>
      <div className="font-display text-2xl sm:text-3xl text-white mt-0.5">{value}</div>
      <div className="text-[10px] text-pitch-500 mt-0.5">{sub}</div>
    </div>
  );
}
