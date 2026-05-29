"use client";

import { useState } from "react";
import { Match, Group, Participant } from "@/types";
import { getTeamInfo, getAllTeams } from "@/data/world-cup-2026";
import { PredictionWindows } from "@/lib/phases";
import { TeamFlag } from "@/components/TeamFlag";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groups] = useState<Group[]>([]);
  const [predictionWindows, setPredictionWindows] = useState<PredictionWindows>({
    groupsLocked: false,
    knockoutOpen: false,
  });
  const [tab, setTab] = useState<"fases" | "results" | "participants" | "knockout">("fases");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setPredictionWindows(data.predictionWindows ?? { groupsLocked: false, knockoutOpen: false });
    setAuthenticated(true);
  }

  async function saveResult(matchId: string, homeScore: number, awayScore: number) {
    setSuccess("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "result", adminPin: pin, matchId, homeScore, awayScore, locked: true }),
    });
    if (res.ok) {
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, homeScore, awayScore, locked: true } : m))
      );
      setSuccess("Resultat desat!");
    }
  }

  async function markPaid(participantId: string) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markPaid", adminPin: pin, participantId }),
    });
    if (res.ok) {
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, entryFeePaid: true } : p))
      );
      setSuccess("Pagament marcat!");
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

  async function updateWindows(updates: Partial<PredictionWindows>) {
    setSuccess("");
    setError("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "predictionWindows", adminPin: pin, windows: updates }),
    });
    const data = await res.json();
    if (res.ok) {
      setPredictionWindows(data.predictionWindows);
      setSuccess("Fase actualitzada!");
    } else {
      setError(data.error || "Error");
    }
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
        {(["fases", "results", "participants", "knockout"] as const).map((t) => (
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
                  Tancar prediccions de grups
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateWindows({ groupsLocked: false })}
                  className="btn-secondary text-sm"
                >
                  Reobrir prediccions de grups
                </button>
              )}
            </div>
            <p className={`text-sm mt-3 ${predictionWindows.groupsLocked ? "text-gold-400" : "text-pitch-500"}`}>
              Estat: {predictionWindows.groupsLocked ? "🔒 Tancada — només lectura" : "✅ Oberta — es poden editar"}
            </p>
          </div>

          <div className="card-glass rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-xl text-gold-500 mb-4">2. Eliminatòries</h2>
            <p className="text-pitch-400 text-sm mb-4">
              Obre aquesta fase quan la fase de grups hagi acabat i estigui puntuada.
              Els jugadors podran predir 32ens, 8ens, quarts, semis i final.
            </p>
            <div className="flex flex-wrap gap-3">
              {!predictionWindows.knockoutOpen ? (
                <button
                  type="button"
                  onClick={() => updateWindows({ knockoutOpen: true })}
                  className="btn-primary text-sm"
                  disabled={!predictionWindows.groupsLocked}
                >
                  Obrir prediccions eliminatòries
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateWindows({ knockoutOpen: false })}
                  className="btn-secondary text-sm"
                >
                  Tancar prediccions eliminatòries
                </button>
              )}
            </div>
            {!predictionWindows.groupsLocked && !predictionWindows.knockoutOpen && (
              <p className="text-pitch-500 text-xs mt-3">
                Primer tanca la fase de grups abans d&apos;obrir eliminatòries (recomanat).
              </p>
            )}
            <p className={`text-sm mt-3 ${predictionWindows.knockoutOpen ? "text-gold-400" : "text-pitch-500"}`}>
              Estat: {predictionWindows.knockoutOpen ? "✅ Oberta" : "🔒 Tancada"}
            </p>
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
                <th className="py-3 px-4 text-center">Pagat</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-pitch-800/50">
                  <td className="py-3 px-4 font-semibold">{p.name}</td>
                  <td className="py-3 px-4 text-center">{Object.keys(p.matches).length}</td>
                  <td className="py-3 px-4 text-center">{p.special ? "✅" : "❌"}</td>
                  <td className="py-3 px-4 text-center">{p.entryFeePaid ? "✅" : "❌"}</td>
                  <td className="py-3 px-4">
                    {!p.entryFeePaid && (
                      <button
                        onClick={() => markPaid(p.id)}
                        className="text-sm text-pitch-400 hover:text-white underline"
                      >
                        Marcar pagat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
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
  const homeTeam = getTeamInfo(match.homeTeam);
  const awayTeam = getTeamInfo(match.awayTeam);

  return (
    <div className="card-glass rounded-xl p-4 flex flex-wrap items-center gap-4">
      <span className="text-sm text-pitch-500 w-16">{match.groupId}</span>
      <span className="flex-1 text-sm flex items-center gap-2">
        <TeamFlag code={homeTeam.code} size={20} />
        {homeTeam.name}
      </span>
      <div className="flex items-center gap-2">
        <input type="number" min={0} max={20} value={home} onChange={(e) => setHome(+e.target.value)} className="score-input w-12" disabled={match.locked} />
        <span>:</span>
        <input type="number" min={0} max={20} value={away} onChange={(e) => setAway(+e.target.value)} className="score-input w-12" disabled={match.locked} />
      </div>
      <span className="flex-1 text-sm text-right flex items-center justify-end gap-2">
        {awayTeam.name}
        <TeamFlag code={awayTeam.code} size={20} />
      </span>
      {!match.locked && (
        <button onClick={() => onSave(match.id, home, away)} className="btn-primary text-sm py-2 px-4">
          Desar
        </button>
      )}
      {match.locked && <span className="text-pitch-500 text-sm">🔒</span>}
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
  onSaveResult: (id: string, h: number, a: number) => void;
}) {
  const [homeTeam, setHomeTeam] = useState(match.homeTeam);
  const [awayTeam, setAwayTeam] = useState(match.awayTeam);
  const [home, setHome] = useState(match.homeScore ?? 0);
  const [away, setAway] = useState(match.awayScore ?? 0);

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
      <div className="flex items-center gap-3">
        <input type="number" min={0} max={20} value={home} onChange={(e) => setHome(+e.target.value)} className="score-input w-12" disabled={match.locked} />
        <span>:</span>
        <input type="number" min={0} max={20} value={away} onChange={(e) => setAway(+e.target.value)} className="score-input w-12" disabled={match.locked} />
        {!match.locked && (
          <button onClick={() => onSaveResult(match.id, home, away)} className="btn-primary text-sm py-2 px-4">
            Desar resultat
          </button>
        )}
      </div>
    </div>
  );
}
