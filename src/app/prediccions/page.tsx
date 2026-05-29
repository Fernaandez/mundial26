"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { MatchCard, GroupSection, PhaseTabs, SpecialForm } from "@/components/PredictionForms";
import { getAllTeams, PHASE_LABELS } from "@/data/world-cup-2026";
import { useAuth } from "@/context/AuthContext";

const PHASES: Phase[] = ["special", "groups", "round32", "round16", "quarter", "semi", "third", "final"];

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [special, setSpecial] = useState<SpecialPredictions | undefined>();
  const [activePhase, setActivePhase] = useState<Phase>("special");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadPredictions = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const res = await fetch(`/api/predictions?id=${user.id}&pin=${user.pin}`);
      if (!res.ok) return;
      const data = await res.json();
      setMatches(data.matches ?? []);
      setGroups(data.groups ?? []);
      setPredictions(data.participant?.matches ?? {});
      setSpecial(data.participant?.special);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPredictions();
  }, [user, loadPredictions]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
          pin: user.pin,
          matches: predictions,
          special,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  function updatePrediction(matchId: string, home: number, away: number) {
    setPredictions((prev) => ({ ...prev, [matchId]: { home, away } }));
    setSaved(false);
  }

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-pitch-400">
        Carregant...
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-pitch-400">
        Carregant prediccions...
      </div>
    );
  }

  const phaseMatches = matches.filter((m) => m.phase === activePhase);
  const predictedCount = Object.keys(predictions).length;
  const totalMatches = matches.filter((m) => !m.locked).length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 md:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <Link href="/perfil" className="text-sm text-pitch-400 hover:text-pitch-200">← Perfil</Link>
          <h1 className="font-display text-3xl sm:text-4xl text-pitch-400 mt-1">PREDICCIONS</h1>
          <p className="text-pitch-300 truncate">{user.name}</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-pitch-400">
            {predictedCount}/{totalMatches} partits
          </span>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Desant..." : "Desar"}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-pitch-700/30 border border-pitch-500 text-pitch-200 px-4 py-3 rounded-xl mb-6 text-sm">
          Prediccions desades correctament!
        </div>
      )}

      <PhaseTabs phases={PHASES} active={activePhase} onChange={setActivePhase} />

      {activePhase === "special" && (
        <SpecialForm
          groups={groups}
          special={special}
          allTeams={getAllTeams()}
          onChange={(s) => { setSpecial(s); setSaved(false); }}
        />
      )}

      {activePhase === "groups" && (
        <div>
          {groups.map((g) => (
            <GroupSection
              key={g.id}
              group={g}
              matches={matches}
              predictions={predictions}
              onChange={updatePrediction}
            />
          ))}
        </div>
      )}

      {activePhase !== "special" && activePhase !== "groups" && (
        <div>
          <h2 className="font-display text-2xl text-pitch-400 mb-4">{PHASE_LABELS[activePhase]}</h2>
          <div className="grid gap-3">
            {phaseMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                prediction={predictions[m.id]}
                onChange={(h, a) => updatePrediction(m.id, h, a)}
              />
            ))}
          </div>
          {phaseMatches.length === 0 && (
            <p className="text-pitch-400 text-center py-8">Encara no hi ha partits definits per aquesta fase.</p>
          )}
        </div>
      )}

      {/* Mobile sticky save bar */}
      <div className="mobile-save-bar">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          <span className="text-sm text-pitch-400 shrink-0">
            {predictedCount}/{totalMatches}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 max-w-xs disabled:opacity-50"
          >
            {saving ? "Desant..." : saved ? "Desat ✓" : "Desar prediccions"}
          </button>
        </div>
      </div>
    </div>
  );
}
