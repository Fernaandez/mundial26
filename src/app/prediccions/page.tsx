"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { MatchCard, GroupSection, PhaseTabs, SpecialForm } from "@/components/PredictionForms";
import { getAllTeams, PHASE_LABELS } from "@/data/world-cup-2026";
import { useAuth } from "@/context/AuthContext";
import {
  PredictionWindows,
  GROUP_STAGE_TABS,
  KNOCKOUT_PHASE_LIST,
  canEditGroupPredictions,
  canEditKnockoutPredictions,
} from "@/lib/phases";

type MainSection = "groups" | "knockout";

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [special, setSpecial] = useState<SpecialPredictions | undefined>();
  const [windows, setWindows] = useState<PredictionWindows>({ groupsLocked: false, knockoutOpen: false });
  const [mainSection, setMainSection] = useState<MainSection>("groups");
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
      setWindows(data.predictionWindows ?? { groupsLocked: false, knockoutOpen: false });
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

  const groupsEditable = canEditGroupPredictions(windows);
  const knockoutEditable = canEditKnockoutPredictions(windows);

  const groupMatchIds = matches.filter((m) => m.phase === "groups").map((m) => m.id);
  const knockoutMatchIds = matches.filter((m) => KNOCKOUT_PHASE_LIST.includes(m.phase)).map((m) => m.id);
  const groupPredicted = groupMatchIds.filter((id) => predictions[id]).length;
  const knockoutPredicted = knockoutMatchIds.filter((id) => predictions[id]).length;

  const phaseMatches = matches.filter((m) => m.phase === activePhase);
  const sectionPredicted = mainSection === "groups" ? groupPredicted : knockoutPredicted;
  const sectionTotal = mainSection === "groups" ? groupMatchIds.length : knockoutMatchIds.length;

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
            {sectionPredicted}/{sectionTotal} partits
          </span>
          {(mainSection === "groups" ? groupsEditable : knockoutEditable) && (
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Desant..." : "Desar"}
            </button>
          )}
        </div>
      </div>

      {/* Main section: Grups vs Eliminatòries */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          type="button"
          onClick={() => { setMainSection("groups"); setActivePhase("special"); }}
          className={`p-4 rounded-xl text-left transition-all ${
            mainSection === "groups" ? "tab-active" : "tab-inactive"
          }`}
        >
          <div className="font-display text-lg sm:text-xl">Fase de grups</div>
          <div className="text-xs sm:text-sm opacity-80 mt-1">
            {groupsEditable ? "Oberta" : "Tancada"} · {groupPredicted}/{groupMatchIds.length}
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setMainSection("knockout"); setActivePhase("round32"); }}
          className={`p-4 rounded-xl text-left transition-all ${
            mainSection === "knockout" ? "tab-active" : "tab-inactive"
          } ${!knockoutEditable ? "opacity-90" : ""}`}
        >
          <div className="font-display text-lg sm:text-xl flex items-center gap-2">
            Eliminatòries
            {!knockoutEditable && <span className="text-base">🔒</span>}
          </div>
          <div className="text-xs sm:text-sm opacity-80 mt-1">
            {knockoutEditable ? "Oberta" : "Encara tancada"} · {knockoutPredicted}/{knockoutMatchIds.length}
          </div>
        </button>
      </div>

      {saved && (
        <div className="bg-pitch-700/30 border border-pitch-500 text-pitch-200 px-4 py-3 rounded-xl mb-6 text-sm">
          Prediccions desades correctament!
        </div>
      )}

      {/* FASE DE GRUPS */}
      {mainSection === "groups" && (
        <>
          {!groupsEditable && (
            <div className="card-glass rounded-xl p-4 mb-6 border border-pitch-600/40">
              <p className="text-pitch-200 font-medium">Fase de grups tancada</p>
              <p className="text-pitch-400 text-sm mt-1">
                Les prediccions de grups ja no es poden editar. Pots consultar-les en mode lectura.
              </p>
            </div>
          )}

          <PhaseTabs
            phases={GROUP_STAGE_TABS}
            active={activePhase}
            onChange={setActivePhase}
          />

          {activePhase === "special" && (
            <SpecialForm
              groups={groups}
              special={special}
              allTeams={getAllTeams()}
              onChange={(s) => { setSpecial(s); setSaved(false); }}
              disabled={!groupsEditable}
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
                  disabled={!groupsEditable}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ELIMINATÒRIES */}
      {mainSection === "knockout" && (
        <>
          {!knockoutEditable ? (
            <div className="card-glass rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="font-display text-2xl text-pitch-300 mb-3">Eliminatòries encara tancades</h2>
              <p className="text-pitch-400 text-sm max-w-md mx-auto">
                Primer s&apos;ha de completar i puntuar la fase de grups. Quan l&apos;admin obri aquesta fase,
                podràs predir 32ens, 8ens, quarts, semis i final.
              </p>
            </div>
          ) : (
            <>
              <div className="card-glass rounded-xl p-4 mb-6 border border-gold-500/30">
                <p className="text-gold-400 font-medium text-sm">Fase d&apos;eliminatòries oberta</p>
                <p className="text-pitch-400 text-xs mt-1">
                  Prediu els partits de 32ens de final fins a la final.
                </p>
              </div>

              <PhaseTabs
                phases={KNOCKOUT_PHASE_LIST}
                active={activePhase}
                onChange={setActivePhase}
              />

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
                {phaseMatches.length === 0 && (
                  <p className="text-pitch-400 text-center py-8">
                    Encara no hi ha equips definits per aquesta fase. L&apos;admin els configurarà quan es coneguin els classificats.
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Mobile sticky save bar */}
      {(mainSection === "groups" ? groupsEditable : knockoutEditable) && (
        <div className="mobile-save-bar">
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
            <span className="text-sm text-pitch-400 shrink-0">
              {sectionPredicted}/{sectionTotal}
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
      )}
    </div>
  );
}
