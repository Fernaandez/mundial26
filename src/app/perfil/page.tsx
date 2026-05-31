"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface ProfileStats {
  total: number;
  predictionsCount: number;
  hasSpecial: boolean;
  rank: number;
  totalPlayers: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetch(`/api/predictions?id=${user.id}&pin=${user.pin}`).then((r) => r.json()),
      fetch("/api/leaderboard").then((r) => r.json()),
    ]).then(([predData, boardData]) => {
      const rank =
        boardData.scores?.findIndex((s: { participantId: string }) => s.participantId === user.id) ?? -1;
      setStats({
        total: boardData.scores?.find((s: { participantId: string }) => s.participantId === user.id)?.total ?? 0,
        predictionsCount: Object.keys(predData.participant?.matches ?? {}).length,
        hasSpecial: !!predData.participant?.special,
        rank: rank >= 0 ? rank + 1 : 0,
        totalPlayers: boardData.participantCount ?? 0,
      });
    }).catch(() => {});
  }, [user]);

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-pitch-400">
        Carregant perfil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 sm:mb-10">
        <div className="min-w-0">
          <p className="text-pitch-400 text-sm uppercase tracking-wider">El teu perfil</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mt-1 truncate">Hola, {user.name}!</h1>
        </div>
        <button onClick={() => { logout(); router.push("/"); }} className="btn-secondary text-sm w-full sm:w-auto">
          Tancar sessió
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Punts totals" value={stats ? `${stats.total}` : "—"} />
        <StatCard label="Posició" value={stats && stats.rank ? `#${stats.rank} de ${stats.totalPlayers}` : "—"} />
        <StatCard label="Partits predits" value={stats ? `${stats.predictionsCount}` : "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ActionCard
          emoji="🎯"
          title="Prediccions"
          desc="Fes i edita les teves prediccions per fase"
          href="/prediccions"
          highlight
        />
        <ActionCard
          emoji="👀"
          title="Prediccions de la gent"
          desc="Mira què han predit els altres participants"
          href="/prediccions/altres"
        />
        <ActionCard
          emoji="🏟️"
          title="Torneig"
          desc="Classificacions de grups i quadre d'eliminatòries"
          href="/torneig"
        />
        <ActionCard
          emoji="🏆"
          title="Classificació"
          desc="Mira el rànquing i els premis"
          href="/classificacio"
        />
        <ActionCard
          emoji="📋"
          title="Reglament"
          desc="Normes i sistema de puntuació"
          href="/regles"
        />
        <ActionCard
          emoji="⚽"
          title="Inici"
          desc="Resum del torneig i participants"
          href="/"
        />
      </div>

      {stats && !stats.hasSpecial && (
        <div className="mt-8 card-glass rounded-2xl p-6 border border-gold-500/30">
          <p className="text-gold-400 font-medium">Pendent: Prediccions especials</p>
          <p className="text-pitch-300 text-sm mt-1">
            Encara no has omplert campió, classificacions de grups, etc.{" "}
            <Link href="/prediccions" className="underline text-pitch-200">Fes-ho ara</Link>
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-glass rounded-2xl p-6 text-center">
      <div className="text-pitch-400 text-sm">{label}</div>
      <div className="font-display text-3xl text-pitch-300 mt-1">{value}</div>
    </div>
  );
}

function ActionCard({
  emoji,
  title,
  desc,
  href,
  highlight,
}: {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card-glass rounded-2xl p-6 block hover:border-pitch-500/50 transition-colors ${
        highlight ? "border border-pitch-500/40" : ""
      }`}
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <h2 className="font-display text-2xl text-white">{title}</h2>
      <p className="text-pitch-400 text-sm mt-2">{desc}</p>
    </Link>
  );
}
