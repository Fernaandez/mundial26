"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Match, Group, SpecialPredictions } from "@/types";
import { PredictionsPanel } from "@/components/PredictionsPanel";
import { useAuth } from "@/context/AuthContext";

interface ParticipantSummary {
  id: string;
  name: string;
  predictionsCount: number;
  hasSpecial: boolean;
}

function AltresPredictionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [special, setSpecial] = useState<SpecialPredictions | undefined>();
  const [bracketPicks, setBracketPicks] = useState<Record<string, string>>({});
  const [targetName, setTargetName] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/participants")
      .then((r) => r.json())
      .then((data) => setParticipants(data.participants ?? []))
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("id");
    if (fromUrl) setSelectedId(fromUrl);
  }, [searchParams]);

  const loadTarget = useCallback(async (targetId: string) => {
    if (!user || !targetId) return;
    setViewLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/predictions/view?viewerId=${user.id}&viewerPin=${encodeURIComponent(user.pin)}&targetId=${targetId}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error carregant prediccions");
        return;
      }
      setMatches(data.matches ?? []);
      setGroups(data.groups ?? []);
      setPredictions(data.participant?.matches ?? {});
      setSpecial(data.participant?.special);
      setBracketPicks(data.participant?.bracketPicks ?? {});
      setTargetName(data.participant?.name ?? "");
    } finally {
      setViewLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedId && user) loadTarget(selectedId);
  }, [selectedId, user, loadTarget]);

  function selectParticipant(id: string) {
    setSelectedId(id);
    if (id) {
      router.replace(`/prediccions/altres?id=${id}`, { scroll: false });
    } else {
      router.replace("/prediccions/altres", { scroll: false });
    }
  }

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-pitch-400">
        Carregant...
      </div>
    );
  }

  const others = participants.filter((p) => p.id !== user.id);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 md:pb-8">
      <Link href="/perfil" className="text-sm text-pitch-400 hover:text-pitch-200">← Perfil</Link>
      <h1 className="font-display text-3xl sm:text-4xl text-pitch-400 mt-1">PREDICCIONS DE LA GENT</h1>
      <p className="text-pitch-300 text-sm mt-1 mb-6">
        Mira què han osat els altres participants. Només lectura.
      </p>

      {listLoading ? (
        <p className="text-pitch-400">Carregant participants...</p>
      ) : others.length === 0 ? (
        <div className="card-glass rounded-2xl p-8 text-center">
          <p className="text-pitch-300">Encara no hi ha altres participants.</p>
        </div>
      ) : (
        <>
          <div className="card-glass rounded-xl p-4 mb-6">
            <label htmlFor="participant-select" className="block text-sm text-pitch-300 mb-2">
              Tria un participant
            </label>
            <select
              id="participant-select"
              value={selectedId}
              onChange={(e) => selectParticipant(e.target.value)}
              className="input-field w-full"
            >
              <option value="">— Selecciona —</option>
              {others.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.predictionsCount} partits{p.hasSpecial ? ", Mundial" : ""})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {others.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectParticipant(p.id)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedId === p.id ? "tab-active" : "tab-inactive"
                }`}
              >
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs opacity-70 mt-0.5">{p.predictionsCount} partits</div>
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {selectedId && viewLoading && (
        <p className="text-pitch-400 text-center py-12">Carregant prediccions...</p>
      )}

      {selectedId && !viewLoading && !error && targetName && (
        <PredictionsPanel
          mode="view"
          participantName={targetName}
          participantId={selectedId}
          matches={matches}
          groups={groups}
          predictions={predictions}
          special={special}
          bracketPicks={bracketPicks}
          backHref="/prediccions/altres"
          backLabel="← Tornar a la llista"
        />
      )}
    </div>
  );
}

export default function AltresPredictionsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-pitch-400">Carregant...</div>
    }>
      <AltresPredictionsContent />
    </Suspense>
  );
}
