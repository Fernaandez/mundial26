"use client";

import { Fragment, useEffect, useState } from "react";
import { ScoreBreakdown } from "@/types";
import { PHASE_LABELS } from "@/data/world-cup-2026";

interface LeaderboardEntry {
  participantId: string;
  name: string;
  total: number;
  breakdown: ScoreBreakdown;
}

interface LeaderboardData {
  scores: LeaderboardEntry[];
  prizes: { pool: number; first: number; second: number; third: number };
  participantCount: number;
  paidCount: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-pitch-400">
        Carregant classificació...
      </div>
    );
  }

  if (!data || data.scores.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 mb-4">CLASSIFICACIÓ</h1>
        <p className="text-pitch-300">Encara no hi ha participants. <a href="/registre" className="text-pitch-400 underline">Registra&apos;t!</a></p>
      </div>
    );
  }

  const maxScore = data.scores[0]?.total || 1;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 text-center mb-2">CLASSIFICACIÓ</h1>
      <p className="text-center text-pitch-300 text-sm sm:text-base mb-6 sm:mb-8">
        {data.participantCount} participants · Premi: <strong className="text-gold-400">{data.prizes.pool}€</strong>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <PrizeCard medal="🥇" place="1r lloc" amount={data.prizes.first} name={data.scores[0]?.name} pts={data.scores[0]?.total} />
        <PrizeCard medal="🥈" place="2n lloc" amount={data.prizes.second} name={data.scores[1]?.name} pts={data.scores[1]?.total} />
        <PrizeCard medal="🥉" place="3r lloc" amount={data.prizes.third} name={data.scores[2]?.name} pts={data.scores[2]?.total} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.scores.map((entry, i) => (
          <div
            key={entry.participantId}
            className={`card-glass rounded-xl p-4 ${i < 3 ? "border border-pitch-700/50" : ""}`}
            onClick={() => setExpanded(expanded === entry.participantId ? null : entry.participantId)}
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl w-8 shrink-0">{i < 3 ? MEDALS[i] : i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{entry.name}</div>
                <div className="h-2 bg-pitch-900 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-pitch-500 rounded-full"
                    style={{ width: `${(entry.total / maxScore) * 100}%` }}
                  />
                </div>
              </div>
              <div className="font-bold text-pitch-400 text-xl shrink-0">{entry.total}</div>
            </div>
            {expanded === entry.participantId && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-pitch-800">
                {(Object.entries(entry.breakdown) as [keyof ScoreBreakdown, number][]).map(([phase, pts]) => (
                  <div key={phase} className="bg-pitch-900/50 rounded-lg p-2 text-center">
                    <div className="text-pitch-400 text-xs truncate">{PHASE_LABELS[phase]}</div>
                    <div className="font-bold text-white">{pts}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card-glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-pitch-700 text-pitch-400 text-sm">
              <th className="py-3 px-4 text-left w-12">#</th>
              <th className="py-3 px-4 text-left">Nom</th>
              <th className="py-3 px-4 text-right">Punts</th>
              <th className="py-3 px-4 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {data.scores.map((entry, i) => (
              <Fragment key={entry.participantId}>
                <tr
                  className={`border-b border-pitch-800/50 hover:bg-pitch-900/30 cursor-pointer ${
                    i < 3 ? "bg-pitch-900/20" : ""
                  }`}
                  onClick={() => setExpanded(expanded === entry.participantId ? null : entry.participantId)}
                >
                  <td className="py-4 px-4 font-display text-xl">
                    {i < 3 ? MEDALS[i] : i + 1}
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">{entry.name}</td>
                  <td className="py-4 px-4 text-right font-bold text-pitch-400 text-lg">{entry.total}</td>
                  <td className="py-4 px-4">
                    <div className="h-2 bg-pitch-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pitch-500 rounded-full transition-all"
                        style={{ width: `${(entry.total / maxScore) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
                {expanded === entry.participantId && (
                  <tr className="bg-pitch-950/50">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        {(Object.entries(entry.breakdown) as [keyof ScoreBreakdown, number][]).map(([phase, pts]) => (
                          <div key={phase} className="bg-pitch-900/50 rounded-lg p-3 text-center">
                            <div className="text-pitch-400 text-xs">{PHASE_LABELS[phase]}</div>
                            <div className="font-bold text-white text-lg">{pts}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PrizeCard({ medal, place, amount, name, pts }: { medal: string; place: string; amount: number; name?: string; pts?: number }) {
  return (
    <div className="card-glass rounded-2xl p-4 sm:p-6 text-center">
      <div className="text-3xl sm:text-4xl mb-2">{medal}</div>
      <div className="font-display text-lg sm:text-xl text-gold-500">{place}</div>
      <div className="font-display text-2xl sm:text-3xl text-white my-2">{amount}€</div>
      {name && (
        <div className="text-sm text-pitch-300 truncate">
          {name} · {pts} pts
        </div>
      )}
    </div>
  );
}
