"use client";

import { useState } from "react";
import type { Participant } from "@/types";
import {
  PLAYER_AWARD_FIELDS,
  type PlayerAwardField,
  type SpecialActualsInput,
} from "@/lib/scoring";

interface AdminSpecialActualsFormProps {
  initial: SpecialActualsInput;
  participants: Participant[];
  adminPin: string;
  onSaved: () => void;
}

const PLAYER_AWARD_LABELS: Record<PlayerAwardField, string> = {
  topScorer: "Màxim golejador",
  topAssists: "Màxim assistent",
  mvp: "Millor jugador (MVP)",
  youngMvp: "Millor jugador jove",
  goldenGlove: "Millor porter",
};

function codesToString(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") return v;
  return "";
}

export function AdminSpecialActualsForm({
  initial,
  participants,
  adminPin,
  onSaved,
}: AdminSpecialActualsFormProps) {
  const [form, setForm] = useState<SpecialActualsInput>({
    topScorer: initial.topScorer ?? "",
    topAssists: initial.topAssists ?? "",
    mvp: initial.mvp ?? "",
    youngMvp: initial.youngMvp ?? "",
    goldenGlove: initial.goldenGlove ?? "",
    surpriseTeam: initial.surpriseTeam ?? "",
    disappointmentTeam: initial.disappointmentTeam ?? "",
  });
  const [awardedParticipantIds, setAwardedParticipantIds] = useState<
    Record<PlayerAwardField, string[]>
  >({
    topScorer: initial.awardedParticipantIds?.topScorer ?? [],
    topAssists: initial.awardedParticipantIds?.topAssists ?? [],
    mvp: initial.awardedParticipantIds?.mvp ?? [],
    youngMvp: initial.awardedParticipantIds?.youngMvp ?? [],
    goldenGlove: initial.awardedParticipantIds?.goldenGlove ?? [],
  });
  // Camps de grups manuals (codis de selecció, comes per empats)
  const [mostGoals, setMostGoals] = useState(codesToString(initial.mostGroupGoals));
  const [mostConceded, setMostConceded] = useState(codesToString(initial.mostGroupGoalsConceded));
  const [nonQualThirds, setNonQualThirds] = useState(codesToString(initial.nonQualifyingThird));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function setField<K extends keyof SpecialActualsInput>(key: K, value: SpecialActualsInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAward(field: PlayerAwardField, participantId: string, checked: boolean) {
    setAwardedParticipantIds((prev) => ({
      ...prev,
      [field]: checked
        ? [...new Set([...prev[field], participantId])]
        : prev[field].filter((id) => id !== participantId),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const actuals: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (typeof v === "string" && v.trim()) {
        actuals[k] = v.trim();
      }
    }
    // Sempre incloure els camps de grups (cadena buida = torna a l'automàtic)
    actuals.mostGroupGoals = mostGoals.trim();
    actuals.mostGroupGoalsConceded = mostConceded.trim();
    actuals.nonQualifyingThird = nonQualThirds.trim();
    actuals.awardedParticipantIds = awardedParticipantIds;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "specialActuals", adminPin, actuals }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Resultats especials desats!");
      onSaved();
    } else {
      const data = await res.json();
      setMessage(data.error || "Error desant");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-5 sm:p-6 space-y-6">
      <div>
        <h2 className="font-display text-xl text-gold-500 mb-2">Resultats especials reals</h2>
        <p className="text-pitch-400 text-sm">
          Jugadors i seleccions. Campió i 3r es calculen sols dels resultats de la final i del partit del 3r lloc.
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg text-pitch-300 mb-3">Jugadors</h3>
        <p className="text-xs text-pitch-500 mb-3">
          Golejador i assistent: en cas d&apos;empat real, introdueix tots els noms separats per comes.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Màxim golejador" value={form.topScorer ?? ""} onChange={(v) => setField("topScorer", v)} placeholder="Nom i Cognom (comes si empat)" />
          <TextInput label="Màxim assistent" value={form.topAssists ?? ""} onChange={(v) => setField("topAssists", v)} placeholder="Nom i Cognom (comes si empat)" />
          <TextInput label="Millor jugador (MVP)" value={form.mvp ?? ""} onChange={(v) => setField("mvp", v)} />
          <TextInput label="Millor jugador jove" value={form.youngMvp ?? ""} onChange={(v) => setField("youngMvp", v)} />
          <TextInput label="Millor porter" value={form.goldenGlove ?? ""} onChange={(v) => setField("goldenGlove", v)} />
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-pitch-200">Qui suma els punts?</h4>
            <p className="text-xs text-pitch-500 mt-1">
              Marca manualment cada resposta vàlida. Aquests checks tenen prioritat sobre com estigui
              escrit el nom del jugador.
            </p>
          </div>
          {PLAYER_AWARD_FIELDS.map((field) => (
            <div key={field} className="rounded-xl border border-pitch-700/60 overflow-hidden">
              <div className="bg-pitch-950/50 px-4 py-3">
                <p className="text-sm font-semibold text-gold-500">{PLAYER_AWARD_LABELS[field]}</p>
                {form[field] && (
                  <p className="text-xs text-pitch-500 mt-1">Resultat real: {form[field]}</p>
                )}
              </div>
              <div className="divide-y divide-pitch-800/70">
                {participants.map((participant) => {
                  const prediction = participant.special?.[field]?.trim() || "Sense resposta";
                  const checked = awardedParticipantIds[field].includes(participant.id);
                  return (
                    <label
                      key={participant.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pitch-900/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleAward(field, participant.id, e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-pitch-200">{participant.name}</span>
                        <span className={`block text-xs truncate ${
                          prediction === "Sense resposta" ? "text-pitch-600" : "text-pitch-400"
                        }`}>
                          Ha posat: {prediction}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {participants.length === 0 && (
                  <p className="px-4 py-3 text-xs text-pitch-500">No hi ha participants.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-pitch-300 mb-3">Grups (manual)</h3>
        <p className="text-xs text-pitch-500 mb-3">
          Introdueix els <strong className="text-pitch-300">codis de selecció</strong> reals. En cas
          d&apos;empat, separa&apos;ls per comes i puntuaran <strong className="text-pitch-300">tots</strong>{" "}
          els qui n&apos;hagin encertat qualsevol. Si ho deixes buit, s&apos;usa el càlcul automàtic.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <TeamListInput
            label="Selecció amb més gols a favor (GF)"
            hint="Ex: IRQ, TUN (empat). 10 punts a qui n'encerti una."
            value={mostGoals}
            onChange={setMostGoals}
          />
          <TeamListInput
            label="Selecció amb més gols encaixats (GC)"
            hint="Ex: IRQ, TUN (empat). 10 punts a qui n'encerti una."
            value={mostConceded}
            onChange={setMostConceded}
          />
          <TeamListInput
            label="3rs que NO passen (els 4 que queden fora)"
            hint="Ex: SCO, HAI, CIV, UZB. 10 punts a qui n'encerti un."
            value={nonQualThirds}
            onChange={setNonQualThirds}
          />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-pitch-300 mb-3">Seleccions</h3>
        <div className="grid grid-cols-1 gap-4">
          <TeamListInput
            label="Selecció revelació"
            hint="Codi selecció separats per comes si n'hi ha més d'una (ex: COL, JPN)"
            value={form.surpriseTeam ?? ""}
            onChange={(v) => setField("surpriseTeam", v)}
          />
          <TeamListInput
            label="Selecció decepció"
            hint="Codi selecció separats per comes si n'hi ha més d'una (ex: ESP, FRA)"
            value={form.disappointmentTeam ?? ""}
            onChange={(v) => setField("disappointmentTeam", v)}
          />
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("Error") ? "text-red-400" : "text-pitch-300"}`}>{message}</p>
      )}

      <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
        {saving ? "Desant..." : "Desar resultats especials"}
      </button>
    </form>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder = "Nom i Cognom",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-pitch-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-pitch-950 border border-pitch-700 rounded-xl text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

function TeamListInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-pitch-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-pitch-950 border border-pitch-700 rounded-xl text-sm"
        placeholder="COL, JPN"
      />
      <p className="text-[10px] text-pitch-500 mt-1">{hint}</p>
    </div>
  );
}
