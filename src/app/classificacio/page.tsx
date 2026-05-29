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
        <h1 className="font-display text-5xl text-pitch-400 mb-4">CLASSIFICACIÓ</h1>
        <p className="text-pitch-300">Encara no hi ha participants. <a href="/registre" className="text-pitch-400 underline">Registra&apos;t!</a></p>
      </div>
    );
  }

  const maxScore = data.scores[0]?.total || 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-5xl text-pitch-400 text-center mb-2">CLASSIFICACIÓ</h1>
      <p className="text-center text-pitch-300 mb-8">
        {data.participantCount} participants · Premi total: <strong className="text-gold-400">{data.prizes.pool}€</strong>
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <PrizeCard medal="🥇" place="1r lloc" amount={data.prizes.first} name={data.scores[0]?.name} pts={data.scores[0]?.total} />
        <PrizeCard medal="🥈" place="2n lloc" amount={data.prizes.second} name={data.scores[1]?.name} pts={data.scores[1]?.total} />
        <PrizeCard medal="🥉" place="3r lloc" amount={data.prizes.third} name={data.scores[2]?.name} pts={data.scores[2]?.total} />
      </div>

      <div className="card-glass rounded-2xl overflow-hidden">
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
    <div className="card-glass rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">{medal}</div>
      <div className="font-display text-xl text-gold-500">{place}</div>
      <div className="font-display text-3xl text-white my-2">{amount}€</div>
      {name && (
        <div className="text-sm text-pitch-300">
          {name} · {pts} pts
        </div>
      )}
    </div>
  );
}
