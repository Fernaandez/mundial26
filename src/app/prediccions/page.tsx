"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Match, Group, SpecialPredictions } from "@/types";
import { PredictionsPanel } from "@/components/PredictionsPanel";
import { useAuth } from "@/context/AuthContext";
import { PredictionWindows } from "@/lib/phases";

export default function PredictionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [special, setSpecial] = useState<SpecialPredictions | undefined>();
  const [bracketPicks, setBracketPicks] = useState<Record<string, string>>({});
  const [windows, setWindows] = useState<PredictionWindows>({ groupsLocked: false, knockoutOpen: false });
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
      setBracketPicks(data.participant?.bracketPicks ?? {});
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
          bracketPicks,
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

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 md:pb-8">
      <PredictionsPanel
        mode="edit"
        participantName={user.name}
        matches={matches}
        groups={groups}
        predictions={predictions}
        special={special}
        bracketPicks={bracketPicks}
        windows={windows}
        onPredictionChange={updatePrediction}
        onSpecialChange={(s) => { setSpecial(s); setSaved(false); }}
        onBracketChange={(p) => { setBracketPicks(p); setSaved(false); }}
        onSave={handleSave}
        saving={saving}
        saved={saved}
      />
    </div>
  );
}
