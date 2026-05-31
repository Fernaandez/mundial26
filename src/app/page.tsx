"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
          subtitle={stats ? `1r: ${stats.prizes.first}€ · 2n: ${stats.prizes.second}€ · 3r: ${stats.prizes.third}€` : "50% · 30% · 20%"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card-glass rounded-2xl p-8">
          <h2 className="font-display text-3xl text-gold-500 mb-4">COM FUNCIONA</h2>
          <ol className="space-y-4 text-pitch-200">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">1</span>
              <span><strong className="text-white">Registra&apos;t</strong> amb el teu nom i un PIN personal</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">2</span>
              <span><strong className="text-white">Fes les prediccions</strong> — grups, eliminatòries i prediccions especials</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">3</span>
              <span><strong className="text-white">Guanya punts</strong> per cada encert — marcador exacte, resultat, classificacions...</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pitch-700 flex items-center justify-center font-bold">4</span>
              <span><strong className="text-white">Classifica&apos;t</strong> i emporta&apos;t el premi!</span>
            </li>
          </ol>
        </div>

        <div className="card-glass rounded-2xl p-8">
          <h2 className="font-display text-3xl text-gold-500 mb-4">FASES DEL TORNEIG</h2>
          <div className="space-y-3 text-pitch-200">
            <PhaseRow name="Prediccions especials" desc="Campió, subcampió, classificacions de grups..." pts="fins a 150+ pts" />
            <PhaseRow name="Fase de grups" desc="72 partits · 12 grups de 4" pts="4 pts max/partit" />
            <PhaseRow name="32ens de final" desc="16 partits" pts="8 pts max/partit" />
            <PhaseRow name="8ens → Final" desc="15 partits eliminatoris" pts="8 pts max/partit" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-2">
        <Link href="/registre" className="btn-primary text-base sm:text-lg text-center">
          Crear compte
        </Link>
        <Link href="/login" className="btn-secondary text-base sm:text-lg text-center">
          Iniciar sessió
        </Link>
        <Link href="/classificacio" className="btn-secondary text-base sm:text-lg text-center">
          Veure classificació
        </Link>
        <Link href="/torneig" className="btn-secondary text-base sm:text-lg text-center">
          Torneig en directe
        </Link>
        <Link href="/regles" className="btn-secondary text-base sm:text-lg text-center">
          Regles completes
        </Link>
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
