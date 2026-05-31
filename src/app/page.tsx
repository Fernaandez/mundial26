"use client";

import { useEffect, useState } from "react";

interface Stats {
  participantCount: number;
  paidCount: number;
  tournament: { name: string; entryFee: number; maxParticipants: number };
  prizes: { pool: number; first: number; second: number; third: number };
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <section className="text-center mb-10 sm:mb-16">
        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl text-pitch-400 tracking-wider mb-4">
          MUNDIAL 2026
        </h1>
        <p className="text-base sm:text-xl text-pitch-200 max-w-2xl mx-auto px-2">
          Quiniela entre amics — prediu resultats, guanya punts i emporta&apos;t el premi
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon="👥"
          title="Participants"
          value={stats ? `${stats.participantCount}/${stats.tournament.maxParticipants}` : "—"}
          subtitle="8-12 jugadors"
        />
        <StatCard
          icon="💰"
          title="Quota d'entrada"
          value={stats ? `${stats.tournament.entryFee}€` : "15€"}
          subtitle="per persona"
        />
        <StatCard
          icon="🏆"
          title="Premi total"
          value={stats ? `${stats.prizes.pool}€` : "—"}
          subtitle={stats ? `1r: ${stats.prizes.first}€ · 2n: ${stats.prizes.second}€ · 3r: ${stats.prizes.third}€` : "70% · 20% · 10%"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-glass rounded-2xl p-8">
          <h2 className="font-display text-3xl text-gold-500 mb-4">COM FUNCIONA</h2>
          <ol className="space-y-4 text-pitch-200">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">1</span>
              <span><strong className="text-white">Registra&apos;t</strong> des del menú superior</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">2</span>
              <span><strong className="text-white">Prediccions de grups</strong> — marcadors i classificació automàtica</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">3</span>
              <span><strong className="text-white">Prediccions del Mundial</strong> — MVP, golejador, assistent, sorpreses…</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">4</span>
              <span><strong className="text-white">Eliminatòries</strong> quan l&apos;admin obri la fase</span>
            </li>
          </ol>
        </div>

        <div className="card-glass rounded-2xl p-8">
          <h2 className="font-display text-3xl text-gold-500 mb-4">FASES DEL TORNEIG</h2>
          <div className="space-y-3 text-pitch-200">
            <PhaseRow name="Fase de grups" desc="72 partits · classificació en viu" pts="4 pts max/partit" />
            <PhaseRow name="Mundial (general)" desc="MVP, golejador, sorpreses, totals…" pts="fins a 150+ pts" />
            <PhaseRow name="16ens de final" desc="16 partits" pts="8 pts max/partit" />
            <PhaseRow name="8ens → Final" desc="15 partits eliminatoris" pts="8 pts max/partit" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: { icon: string; title: string; value: string; subtitle: string }) {
  return (
    <div className="card-glass rounded-2xl p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-pitch-400 text-sm uppercase tracking-wider">{title}</div>
      <div className="font-display text-4xl text-white mt-1">{value}</div>
      <div className="text-pitch-400 text-sm mt-1">{subtitle}</div>
    </div>
  );
}

function PhaseRow({ name, desc, pts }: { name: string; desc: string; pts: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-pitch-800/50">
      <div>
        <div className="font-semibold text-white">{name}</div>
        <div className="text-sm text-pitch-400">{desc}</div>
      </div>
      <div className="text-sm text-gold-400 font-medium whitespace-nowrap ml-4">{pts}</div>
    </div>
  );
}
