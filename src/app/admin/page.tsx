"use client";

import { useState } from "react";
import { Match, Group, Participant } from "@/types";
import { getTeamInfo, getAllTeams } from "@/data/world-cup-2026";
import {
  PredictionWindows,
  DEFAULT_PREDICTION_WINDOWS,
  KnockoutWindowPhase,
  PredictionWindowsUpdate,
  KNOCKOUT_WINDOW_PHASES,
  KNOCKOUT_ADMIN_LABELS,
  allKnockoutPhasesOpen,
  canEditKnockoutPredictions,
} from "@/lib/phases";
import { MatchScoreboard } from "@/components/MatchScoreboard";
import { AdminSpecialActualsForm } from "@/components/AdminSpecialActualsForm";
import { TeamFlag } from "@/components/TeamFlag";
import { isKnockoutPhase } from "@/lib/phases";
import type { SpecialActualsInput } from "@/lib/scoring";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groups] = useState<Group[]>([]);
  const [predictionWindows, setPredictionWindows] = useState<PredictionWindows>(
    DEFAULT_PREDICTION_WINDOWS
  );
  const [tab, setTab] = useState<"fases" | "results" | "participants" | "knockout" | "specials">("fases");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [specialActuals, setSpecialActuals] = useState<SpecialActualsInput>({});

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/admin?pin=${pin}`);
    if (!res.ok) {
      setError("PIN d'admin incorrecte");
      return;
    }
    const data = await res.json();
    setMatches(data.matches);
    setParticipants(data.participants);
    setPredictionWindows(data.predictionWindows ?? DEFAULT_PREDICTION_WINDOWS);
    setSpecialActuals(data.specialActuals ?? {});
    setAuthenticated(true);
  }

  async function saveResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    options?: { knockoutWinner?: string; etHomeScore?: number; etAwayScore?: number }
  ) {
    setSuccess("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "result",
        adminPin: pin,
        matchId,
        homeScore,
        awayScore,
        locked: true,
        knockoutWinner: options?.knockoutWinner,
        etHomeScore: options?.etHomeScore,
        etAwayScore: options?.etAwayScore,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, ...data.match } : m))
      );
      const refresh = await fetch(`/api/admin?pin=${pin}`);
      if (refresh.ok) {
        const refreshed = await refresh.json();
        setMatches(refreshed.matches);
      }
      setSuccess("Resultat desat!");
    } else {
      const data = await res.json();
      setError(data.error ?? "Error desant resultat");
    }
  }

  async function markAcknowledged(participantId: string) {
    setSuccess("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAcknowledged", adminPin: pin, participantId }),
    });
    if (res.ok) {
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, entryFeePaid: true } : p))
      );
      setSuccess("Marcat com a conegut!");
    }
  }

  async function removeParticipant(participantId: string, name: string) {
    if (!window.confirm(`Eliminar ${name}? Es perdran totes les seves prediccions.`)) return;
    setSuccess("");
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteParticipant", adminPin: pin, participantId }),
    });
    const data = await res.json();
    if (res.ok) {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setSuccess(`${name} eliminat`);
    } else {
      setError(data.error || "Error eliminant participant");
    }
  }

  async function addParticipant(name: string, participantPin: string) {
    setSuccess("");
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addParticipant", adminPin: pin, name, pin: participantPin }),
    });
    const data = await res.json();
    if (res.ok) {
      const refresh = await fetch(`/api/admin?pin=${pin}`);
      const refreshed = await refresh.json();
      setParticipants(refreshed.participants);
      setSuccess(`${name} afegit! Passa-li el PIN: ${participantPin}`);
      return true;
    }
    setError(data.error || "Error afegint participant");
    return false;
  }

  async function openForTesting() {
    setSuccess("");
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "openAllForTesting", adminPin: pin }),
    });
    const data = await res.json();
    if (res.ok) {
      setPredictionWindows(data.predictionWindows);
      setSuccess("Mode proves: grups i eliminatòries obertes!");
    } else {
      setError(data.error || "Error");
    }
  }

  async function resetQuiniela() {
    if (
      !window.confirm(
        "Netejar tot el torneig?\n\nEsborrarà participants, prediccions, resultats i estat de fases. El torneig tornarà a zero.\n\nAquesta acció no es pot desfer."
      )
    ) {
      return;
    }
    setSuccess("");
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetQuiniela", adminPin: pin }),
    });
    const data = await res.json();
    if (res.ok) {
      setMatches(data.matches);
      setParticipants(data.participants);
      setPredictionWindows(data.predictionWindows ?? DEFAULT_PREDICTION_WINDOWS);
      setSuccess("Torneig netejat — pots començar de nou!");
    } else {
      setError(data.error || "Error en netejar");
    }
  }

  async function updateWindows(updates: PredictionWindowsUpdate) {
    setSuccess("");
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "predictionWindows",
        adminPin: pin,
        windows: {
          ...updates,
          knockoutPhasesOpen: updates.knockoutPhasesOpen
            ? {
                ...predictionWindows.knockoutPhasesOpen,
                ...updates.knockoutPhasesOpen,
              }
            : undefined,
          testMode: false,
        },
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPredictionWindows(data.predictionWindows);
      setSuccess("Fase actualitzada!");
    } else {
      setError(data.error || "Error");
    }
  }

  async function toggleKnockoutPhase(phase: KnockoutWindowPhase, open: boolean) {
    await updateWindows({
      knockoutPhasesOpen: { [phase]: open },
    });
  }

  async function setAllKnockoutPhases(open: boolean) {
    await updateWindows({ knockoutPhasesOpen: allKnockoutPhasesOpen(open) });
  }

  async function updateKnockoutMatch(matchId: string, homeTeam: string, awayTeam: string) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "knockoutTeams", adminPin: pin, matchId, homeTeam, awayTeam }),
    });
    if (res.ok) {
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, homeTeam, awayTeam } : m))
      );
      setSuccess("Equips actualitzats!");
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="font-display text-5xl text-pitch-400 text-center mb-8">ADMIN</h1>
        <form onSubmit={login} className="card-glass rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm text-pitch-300 mb-2">PIN d&apos;administrador</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-700 rounded-xl"
            />
            <p className="text-xs text-pitch-500 mt-1">Per defecte: mundial2026</p>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="btn-primary w-full">Entrar</button>
        </form>
      </div>
    );
  }

  const groupMatches = matches.filter((m) => m.phase === "groups");
  const knockoutMatches = matches.filter((m) => m.phase !== "groups");
  const groupResultsCount = groupMatches.filter((m) => m.homeScore !== undefined).length;
  const allTeams = getAllTeams();

  const tabLabels: Record<typeof tab, string> = {
    fases: "Fases prediccions",
    results: "Resultats grups",
    participants: "Participants",
    knockout: "Eliminatòries",
    specials: "Especials",
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="font-display text-3xl sm:text-4xl text-pitch-400 mb-6">PANEL ADMIN</h1>

      {success && (
        <div className="bg-pitch-700/30 border border-pitch-500 text-pitch-200 px-4 py-3 rounded-xl mb-6 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="phase-tabs-scroll -mx-3 px-3 sm:mx-0 sm:px-0 mb-8">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
        {(["fases", "results", "participants", "knockout", "specials"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              tab === t ? "tab-active" : "tab-inactive"
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
        </div>
      </div>

      {tab === "fases" && (
        <div className="space-y-6">
          <div className="card-glass rounded-2xl p-5 sm:p-6 border border-gold-500/20">
            <h2 className="font-display text-xl text-gold-500 mb-3">Mode proves</h2>
            <p className="text-pitch-400 text-sm mb-4">
              Obre grups i eliminatòries alhora per provar prediccions (Setzens, Vuitens, quadre…)
              abans de les dates reals del torneig.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={openForTesting} className="btn-primary text-sm">
                Obrir tot (proves)
              </button>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-xl text-gold-500 mb-4">1. Fase de grups</h2>
            <p className="text-pitch-400 text-sm mb-4">
              Els jugadors omplen prediccions especials + 72 partits de grups.
              Resultats introduïts: <strong className="text-white">{groupResultsCount}/{groupMatches.length}</strong>
            </p>
            <div className="flex flex-wrap gap-3">
              {!predictionWindows.groupsLocked ? (
                <button
                  type="button"
                  onClick={() => updateWindows({ groupsLocked: true })}
                  className="btn-primary text-sm"
                >
                  Tancar grups i prediccions especials
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateWindows({ groupsLocked: false })}
                  className="btn-secondary text-sm"
                >
                  Reobrir grups i prediccions especials
                </button>
              )}
            </div>
            <p className={`text-sm mt-3 ${predictionWindows.groupsLocked ? "text-gold-400" : "text-pitch-500"}`}>
              Estat: {predictionWindows.groupsLocked ? "🔒 Tancada — grups, especials i Mundial només lectura" : "✅ Oberta — es poden editar"}
            </p>
          </div>

          <div className="card-glass rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-xl text-gold-500 mb-4">2. Eliminatòries</h2>
            <p className="text-pitch-400 text-sm mb-4">
              Obre o tanca cada ronda per separat. Els jugadors podran predir marcadors de les rondes
              obertes. <strong className="text-pitch-200">Setzens (1/16)</strong> també desbloqueja la
              pestanya Quadre.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                type="button"
                onClick={() => setAllKnockoutPhases(true)}
                className="btn-primary text-sm"
              >
                Obrir totes
              </button>
              <button
                type="button"
                onClick={() => setAllKnockoutPhases(false)}
                className="btn-secondary text-sm"
              >
                Tancar totes
              </button>
            </div>
            <div className="space-y-3">
              {KNOCKOUT_WINDOW_PHASES.map((phase) => {
                const { title, hint } = KNOCKOUT_ADMIN_LABELS[phase];
                const open = predictionWindows.knockoutPhasesOpen[phase];
                return (
                  <div
                    key={phase}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-pitch-700/50 bg-pitch-950/30 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-pitch-100">{title}</p>
                      <p className="text-xs text-pitch-500">{hint}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-sm ${open ? "text-gold-400" : "text-pitch-500"}`}>
                        {open ? "✅ Oberta" : "🔒 Tancada"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleKnockoutPhase(phase, !open)}
                        className={open ? "btn-secondary text-sm py-1.5 px-3" : "btn-primary text-sm py-1.5 px-3"}
                      >
                        {open ? "Tancar" : "Obrir"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {!canEditKnockoutPredictions(predictionWindows) && (
              <p className="text-pitch-500 text-xs mt-4">
                També pots usar «Obrir tot (proves)» a dalt per obrir grups i totes les rondes alhora.
              </p>
            )}
            {predictionWindows.testMode && (
              <p className="text-sm mt-4 text-gold-400">Mode proves actiu — finestres de calendari ignorades.</p>
            )}
          </div>

          <div className="card-glass rounded-2xl p-5 sm:p-6 border border-red-800/40">
            <h2 className="font-display text-xl text-red-400 mb-3">Netejar torneig</h2>
            <p className="text-pitch-400 text-sm mb-4">
              Esborra participants, prediccions, resultats i torna les fases al valor inicial.
              Útil per començar la porra de zero. El PIN d&apos;admin es manté.
            </p>
            <button
              type="button"
              onClick={resetQuiniela}
              className="text-sm py-2 px-4 rounded-xl border border-red-700/60 text-red-300 hover:bg-red-900/20 transition-colors"
            >
              Netejar tot
            </button>
          </div>
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-3">
          {groupMatches.map((m) => (
            <ResultRow key={m.id} match={m} onSave={saveResult} />
          ))}
        </div>
      )}

      {tab === "participants" && (
        <div className="space-y-6">
          <AddParticipantForm onAdd={addParticipant} />
          <div className="card-glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pitch-700 text-pitch-400 text-sm">
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-center">Prediccions</th>
                <th className="py-3 px-4 text-center">Especials</th>
                <th className="py-3 px-4 text-center">Conegut</th>
                <th className="py-3 px-4 text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-pitch-800/50">
                  <td className="py-3 px-4 font-semibold">{p.name}</td>
                  <td className="py-3 px-4 text-center">{Object.keys(p.matches).length}</td>
                  <td className="py-3 px-4 text-center">{p.special ? "✅" : "❌"}</td>
                  <td className="py-3 px-4 text-center">{p.entryFeePaid ? "✅" : "❌"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                      {!p.entryFeePaid && (
                        <button
                          type="button"
                          onClick={() => markAcknowledged(p.id)}
                          className="text-sm text-pitch-400 hover:text-white underline"
                        >
                          Marcar com a conegut
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeParticipant(p.id, p.name)}
                        className="text-sm text-red-400 hover:text-red-300 underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === "specials" && (
        <AdminSpecialActualsForm
          initial={specialActuals}
          adminPin={pin}
          onSaved={async () => {
            setSuccess("Resultats especials actualitzats!");
            const refresh = await fetch(`/api/admin?pin=${pin}`);
            if (refresh.ok) {
              const data = await refresh.json();
              setSpecialActuals(data.specialActuals ?? {});
            }
          }}
        />
      )}

      {tab === "knockout" && (
        <div className="space-y-4">
          <p className="text-pitch-400 text-sm mb-4">Defineix els equips de cada partit eliminatori i introdueix resultats.</p>
          {knockoutMatches.map((m) => (
            <KnockoutRow
              key={m.id}
              match={m}
              teams={allTeams}
              onUpdateTeams={updateKnockoutMatch}
              onSaveResult={saveResult}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddParticipantForm({ onAdd }: { onAdd: (name: string, pin: string) => Promise<boolean> }) {
  const [name, setName] = useState("");
  const [participantPin, setParticipantPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await onAdd(name, participantPin);
    if (ok) {
      setName("");
      setParticipantPin("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-6">
      <h3 className="font-display text-xl text-gold-500 mb-4">Afegir participant</h3>
      <p className="text-sm text-pitch-400 mb-4">Registra els amics des d&apos;aquí. Passa&apos;ls el nom i el PIN per entrar a Prediccions.</p>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom"
          required
          className="flex-1 min-w-[120px] px-4 py-2 bg-pitch-950 border border-pitch-700 rounded-xl"
        />
        <input
          type="text"
          value={participantPin}
          onChange={(e) => setParticipantPin(e.target.value)}
          placeholder="PIN (mín. 4)"
          required
          minLength={4}
          className="w-32 px-4 py-2 bg-pitch-950 border border-pitch-700 rounded-xl"
        />
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 disabled:opacity-50">
          {loading ? "..." : "Afegir"}
        </button>
      </div>
    </form>
  );
}

function ResultRow({ match, onSave }: { match: Match; onSave: (id: string, h: number, a: number) => void }) {
  const [home, setHome] = useState(match.homeScore ?? 0);
  const [away, setAway] = useState(match.awayScore ?? 0);

  return (
    <div className="card-glass rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-display text-pitch-400 w-16">{match.groupId}</span>
        <div className="flex-1 min-w-[200px]">
          <MatchScoreboard match={{ ...match, homeScore: home, awayScore: away }} variant="compact" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-end">
        <input type="number" min={0} max={20} value={home} onChange={(e) => setHome(+e.target.value)} className="score-input w-12" disabled={match.locked} aria-label="Gols local" />
        <span>:</span>
        <input type="number" min={0} max={20} value={away} onChange={(e) => setAway(+e.target.value)} className="score-input w-12" disabled={match.locked} aria-label="Gols visitant" />
        {!match.locked && (
          <button onClick={() => onSave(match.id, home, away)} className="btn-primary text-sm py-2 px-4">
            Desar
          </button>
        )}
        {match.locked && <span className="text-pitch-500 text-sm">🔒</span>}
      </div>
    </div>
  );
}

function KnockoutRow({
  match,
  teams,
  onUpdateTeams,
  onSaveResult,
}: {
  match: Match;
  teams: { code: string; name: string; iso: string }[];
  onUpdateTeams: (id: string, home: string, away: string) => void;
  onSaveResult: (
    id: string,
    h: number,
    a: number,
    options?: { knockoutWinner?: string; etHomeScore?: number; etAwayScore?: number }
  ) => void;
}) {
  const [homeTeam, setHomeTeam] = useState(match.homeTeam);
  const [awayTeam, setAwayTeam] = useState(match.awayTeam);
  const [home, setHome] = useState(match.homeScore ?? 0);
  const [away, setAway] = useState(match.awayScore ?? 0);
  const [etHome, setEtHome] = useState<number | "">(match.etHomeScore ?? "");
  const [etAway, setEtAway] = useState<number | "">(match.etAwayScore ?? "");
  const [useEt, setUseEt] = useState(match.etHomeScore !== undefined);
  const [winner, setWinner] = useState(match.knockoutWinner ?? "");
  const isDraw = home === away;
  const needsWinner =
    isKnockoutPhase(match.phase) &&
    isDraw &&
    homeTeam !== "TBD" &&
    awayTeam !== "TBD" &&
    !(useEt && etHome !== "" && etAway !== "" && etHome !== etAway);

  function handleSave() {
    if (needsWinner && !winner) {
      alert("Selecciona qui passa de ronda en cas d'empat a 90 min, o introdueix el resultat final (pròrroga/penals).");
      return;
    }
    onSaveResult(match.id, home, away, {
      knockoutWinner: needsWinner ? winner : undefined,
      etHomeScore: useEt && etHome !== "" ? Number(etHome) : undefined,
      etAwayScore: useEt && etAway !== "" ? Number(etAway) : undefined,
    });
  }

  return (
    <div className="card-glass rounded-xl p-4 space-y-3">
      <div className="text-xs text-pitch-500 uppercase">{match.label}</div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} className="px-3 py-2 bg-pitch-950 border border-pitch-700 rounded-lg text-sm">
          {teams.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          <option value="TBD">❓ Per definir</option>
        </select>
        <span className="text-pitch-500">vs</span>
        <select value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} className="px-3 py-2 bg-pitch-950 border border-pitch-700 rounded-lg text-sm">
          {teams.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          <option value="TBD">❓ Per definir</option>
        </select>
        <button onClick={() => onUpdateTeams(match.id, homeTeam, awayTeam)} className="btn-secondary text-sm py-2 px-3">
          Actualitzar equips
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-pitch-400">Marcador a 90 min (puntuació de prediccions)</p>
        <div className="flex flex-wrap items-center gap-3">
          <input type="number" min={0} max={20} value={home} onChange={(e) => setHome(+e.target.value)} className="score-input w-12" disabled={match.locked} />
          <span>:</span>
          <input type="number" min={0} max={20} value={away} onChange={(e) => setAway(+e.target.value)} className="score-input w-12" disabled={match.locked} />
        </div>
      </div>
      {!match.locked && isKnockoutPhase(match.phase) && (
        <div className="border border-pitch-700/50 rounded-xl p-3 space-y-2">
          <label className="flex items-center gap-2 text-xs text-pitch-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useEt}
              onChange={(e) => setUseEt(e.target.checked)}
              className="rounded"
            />
            Resultat final després de pròrroga/penals (actualitza el quadre)
          </label>
          {useEt && (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                max={30}
                value={etHome}
                onChange={(e) => setEtHome(e.target.value === "" ? "" : +e.target.value)}
                className="score-input w-12"
                placeholder="ET"
                aria-label="Gols local pròrroga/penals"
              />
              <span>:</span>
              <input
                type="number"
                min={0}
                max={30}
                value={etAway}
                onChange={(e) => setEtAway(e.target.value === "" ? "" : +e.target.value)}
                className="score-input w-12"
                placeholder="ET"
                aria-label="Gols visitant pròrroga/penals"
              />
              <span className="text-xs text-pitch-500">Ex.: 1-1 a 90 min → 3-2 després de penals</span>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {!match.locked && (
          <button onClick={handleSave} className="btn-primary text-sm py-2 px-4">
            Desar resultat
          </button>
        )}
        {match.locked && match.knockoutWinner && (
          <span className="text-xs text-gold-400">Passa: {getTeamInfo(match.knockoutWinner).name}</span>
        )}
        {match.locked && match.etHomeScore !== undefined && (
          <span className="text-xs text-pitch-400">
            Final: {match.etHomeScore}-{match.etAwayScore} (90 min: {match.homeScore}-{match.awayScore})
          </span>
        )}
      </div>
      {needsWinner && !match.locked && (
        <div className="border border-amber-700/40 rounded-xl p-3 bg-amber-900/10">
          <p className="text-xs text-amber-100 mb-2">Empat a 90 min — qui passa de ronda? (si no hi ha resultat final)</p>
          <div className="flex items-center gap-3">
            <WinnerPick
              code={homeTeam}
              name={getTeamInfo(homeTeam).name}
              selected={winner === homeTeam}
              onClick={() => setWinner(homeTeam)}
            />
            <WinnerPick
              code={awayTeam}
              name={getTeamInfo(awayTeam).name}
              selected={winner === awayTeam}
              onClick={() => setWinner(awayTeam)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function WinnerPick({
  code,
  name,
  selected,
  onClick,
}: {
  code: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      className={`rounded-lg p-2 transition-all ${
        selected ? "bg-gold-500/25 ring-2 ring-gold-500" : "bg-pitch-950/50 hover:bg-pitch-800/80"
      }`}
    >
      <TeamFlag code={code} size={28} />
    </button>
  );
}
