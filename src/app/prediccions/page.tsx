"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { MatchCard, GroupSection, PhaseTabs, MundialForm } from "@/components/PredictionForms";
import { getAllTeams, PHASE_LABELS } from "@/data/world-cup-2026";
import { useAuth } from "@/context/AuthContext";
import {
  PredictionWindows,
  KNOCKOUT_PHASE_LIST,
  canEditGroupPredictions,
  canEditKnockoutPredictions,
} from "@/lib/phases";

type MainSection = "groups" | "knockout" | "mundial";

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [special, setSpecial] = useState<SpecialPredictions | undefined>();
  const [windows, setWindows] = useState<PredictionWindows>({ groupsLocked: false, knockoutOpen: false });
  const [mainSection, setMainSection] = useState<MainSection>("groups");
  const [activePhase, setActivePhase] = useState<Phase>("round32");
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
      setWindows(data.predictionWindows ?? { groupsLocked: false, knockoutOpen: false });
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadPredictions();
  }, [user, loadPredictions]);

  useEffect(() => {
    if (!user) return;
    const refreshResults = async () => {
      const res = await fetch("/api/tournament", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches ?? []);
      }
    };
    const interval = setInterval(refreshResults, 15000);
    return () => clearInterval(interval);
  }, [user]);

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

  const groupsEditable = canEditGroupPredictions(windows);
  const knockoutEditable = canEditKnockoutPredictions(windows);

  const groupMatchIds = matches.filter((m) => m.phase === "groups").map((m) => m.id);
  const knockoutMatchIds = matches.filter((m) => KNOCKOUT_PHASE_LIST.includes(m.phase)).map((m) => m.id);
  const groupPredicted = groupMatchIds.filter((id) => predictions[id]).length;
  const knockoutPredicted = knockoutMatchIds.filter((id) => predictions[id]).length;

  const phaseMatches = matches.filter((m) => m.phase === activePhase);

  const mundialFilled = [
    special?.champion,
    special?.runnerUp,
    special?.thirdPlace,
    special?.topScorer,
    special?.topAssists,
  ].filter(Boolean).length;

  const canSave =
    mainSection === "groups" ? groupsEditable :
    mainSection === "knockout" ? knockoutEditable :
    true;

  const sectionLabel =
    mainSection === "groups" ? `${groupPredicted}/${groupMatchIds.length} partits` :
    mainSection === "knockout" ? `${knockoutPredicted}/${knockoutMatchIds.length} partits` :
    `${mundialFilled}/5 prediccions`;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 md:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <Link href="/perfil" className="text-sm text-pitch-400 hover:text-pitch-200">← Perfil</Link>
          <h1 className="font-display text-3xl sm:text-4xl text-pitch-400 mt-1">PREDICCIONS</h1>
          <p className="text-pitch-300 truncate">{user.name}</p>
          <Link href="/torneig" className="text-xs text-gold-500 hover:text-gold-400 mt-1 inline-block">
            Veure classificacions i quadre →
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-pitch-400">{sectionLabel}</span>
          {canSave && (
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Desant..." : "Desar"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMainSection("groups")}
          className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
            mainSection === "groups" ? "tab-active" : "tab-inactive"
          }`}
        >
          <div className="font-display text-base sm:text-lg">Grups</div>
          <div className="text-[10px] sm:text-xs opacity-80 mt-1">
            {groupsEditable ? "Oberta" : "Tancada"} · {groupPredicted}/{groupMatchIds.length}
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setMainSection("knockout"); setActivePhase("round32"); }}
          className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
            mainSection === "knockout" ? "tab-active" : "tab-inactive"
          }`}
        >
          <div className="font-display text-base sm:text-lg flex items-center gap-1">
            Elim.
            {!knockoutEditable && <span className="text-sm">🔒</span>}
          </div>
          <div className="text-[10px] sm:text-xs opacity-80 mt-1">
            {knockoutPredicted}/{knockoutMatchIds.length}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMainSection("mundial")}
          className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
            mainSection === "mundial" ? "tab-active" : "tab-inactive"
          }`}
        >
          <div className="font-display text-base sm:text-lg">Mundial</div>
          <div className="text-[10px] sm:text-xs opacity-80 mt-1">
            Campió, gols… · {mundialFilled}/5
          </div>
        </button>
      </div>

      {saved && (
        <div className="bg-pitch-700/30 border border-pitch-500 text-pitch-200 px-4 py-3 rounded-xl mb-6 text-sm">
          Prediccions desades correctament!
        </div>
      )}

      {mainSection === "groups" && (
        <>
          {!groupsEditable && (
            <div className="card-glass rounded-xl p-4 mb-6 border border-pitch-600/40">
              <p className="text-pitch-200 font-medium">Fase de grups tancada</p>
              <p className="text-pitch-400 text-sm mt-1">Només lectura.</p>
            </div>
          )}
          <p className="text-sm text-pitch-400 mb-4">
            La classificació s&apos;actualitza al moment en omplir cada marcador (GF, GC, DG, Pts).
          </p>
          <div>
            {groups.map((g) => (
              <GroupSection
                key={g.id}
                group={g}
                groups={groups}
                matches={matches}
                predictions={predictions}
                onChange={updatePrediction}
                disabled={!groupsEditable}
              />
            ))}
          </div>
        </>
      )}

      {mainSection === "knockout" && (
        <>
          {!knockoutEditable ? (
            <div className="card-glass rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="font-display text-2xl text-pitch-300 mb-3">Eliminatòries encara tancades</h2>
              <p className="text-pitch-400 text-sm max-w-md mx-auto">
                Quan l&apos;admin obri aquesta fase podràs predir 16ens, 8ens, quarts, semis i final.
              </p>
            </div>
          ) : (
            <>
              <PhaseTabs phases={KNOCKOUT_PHASE_LIST} active={activePhase} onChange={setActivePhase} />
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-pitch-400 mb-4">{PHASE_LABELS[activePhase]}</h2>
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
              </div>
            </>
          )}
        </>
      )}

      {mainSection === "mundial" && (
        <MundialForm
          groups={groups}
          special={special}
          allTeams={getAllTeams()}
          onChange={(s) => { setSpecial(s); setSaved(false); }}
          disabled={false}
        />
      )}

      {canSave && (
        <div className="mobile-save-bar">
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
            <span className="text-sm text-pitch-400 shrink-0">{sectionLabel}</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 max-w-xs disabled:opacity-50"
            >
              {saving ? "Desant..." : saved ? "Desat ✓" : "Desar prediccions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
