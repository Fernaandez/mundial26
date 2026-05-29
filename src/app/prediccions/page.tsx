"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Match, Group, SpecialPredictions, Phase } from "@/types";
import { MatchCard, GroupSection, PhaseTabs, SpecialForm } from "@/components/PredictionForms";
import { getAllTeams, PHASE_LABELS } from "@/data/world-cup-2026";

const PHASES: Phase[] = ["special", "groups", "round32", "round16", "quarter", "semi", "third", "final"];

interface UserSession {
  id: string;
  name: string;
  pin: string;
}

export default function PredictionsPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loginId, setLoginId] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState("");

  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [special, setSpecial] = useState<SpecialPredictions | undefined>();
  const [activePhase, setActivePhase] = useState<Phase>("special");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("quiniela_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("quiniela_user");
      }
    }
    fetch("/api/participants")
      .then((r) => r.json())
      .then((d) => setParticipants(d.participants ?? []))
      .catch(() => {});
  }, []);

  const loadPredictions = useCallback(async (u: UserSession) => {
    const res = await fetch(`/api/predictions?id=${u.id}&pin=${u.pin}`);
    if (!res.ok) return;
    const data = await res.json();
    setMatches(data.matches ?? []);
    setGroups(data.groups ?? []);
    setPredictions(data.participant?.matches ?? {});
    setSpecial(data.participant?.special);
  }, []);

  useEffect(() => {
    if (user) loadPredictions(user);
  }, [user, loadPredictions]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(`/api/predictions?id=${loginId}&pin=${loginPin}`);
    if (!res.ok) {
      setLoginError("ID o PIN incorrecte");
      return;
    }
    const data = await res.json();
    const session = { id: loginId, name: data.participant.name, pin: loginPin };
    localStorage.setItem("quiniela_user", JSON.stringify(session));
    setUser(session);
  }

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

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="font-display text-5xl text-pitch-400 text-center mb-8">PREDICCIONS</h1>
        <form onSubmit={handleLogin} className="card-glass rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-pitch-300 mb-2">Participant</label>
            <select
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-700 rounded-xl"
            >
              <option value="">— Selecciona —</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-pitch-300 mb-2">PIN</label>
            <input
              type="password"
              value={loginPin}
              onChange={(e) => setLoginPin(e.target.value)}
              required
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-700 rounded-xl"
            />
          </div>
          {loginError && <div className="text-red-400 text-sm">{loginError}</div>}
          <button type="submit" className="btn-primary w-full">Entrar</button>
          <p className="text-center text-sm text-pitch-400">
            Encara no estàs registrat?{" "}
            <Link href="/registre" className="text-pitch-400 underline">Registra&apos;t</Link>
          </p>
        </form>
      </div>
    );
  }

  const phaseMatches = matches.filter((m) => m.phase === activePhase);
  const predictedCount = Object.keys(predictions).length;
  const totalMatches = matches.filter((m) => !m.locked).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl text-pitch-400">PREDICCIONS</h1>
          <p className="text-pitch-300">Hola, <strong className="text-white">{user.name}</strong></p>
        </div>
        <div className="flex items-center gap-3">
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
    </div>
  );
}
