"use client";

import { useState } from "react";
import { getAllTeams } from "@/data/world-cup-2026";
import { FIFA_TOP_10_CODES } from "@/data/rules-config";
import { TeamFlag } from "@/components/TeamFlag";
import type { SpecialActualsInput } from "@/lib/scoring";

interface AdminSpecialActualsFormProps {
  initial: SpecialActualsInput;
  adminPin: string;
  onSaved: () => void;
}

export function AdminSpecialActualsForm({ initial, adminPin, onSaved }: AdminSpecialActualsFormProps) {
  const allTeams = getAllTeams();
  const top10Teams = allTeams.filter((t) => (FIFA_TOP_10_CODES as readonly string[]).includes(t.code));
  const revelationTeams = allTeams.filter((t) => !(FIFA_TOP_10_CODES as readonly string[]).includes(t.code));

  const [form, setForm] = useState<SpecialActualsInput>({
    topScorer: initial.topScorer ?? "",
    topAssists: initial.topAssists ?? "",
    mvp: initial.mvp ?? "",
    youngMvp: initial.youngMvp ?? "",
    goldenGlove: initial.goldenGlove ?? "",
    champion: initial.champion ?? "",
    thirdPlace: initial.thirdPlace ?? "",
    surpriseTeam: initial.surpriseTeam ?? "",
    disappointmentTeam: initial.disappointmentTeam ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function setField<K extends keyof SpecialActualsInput>(key: K, value: SpecialActualsInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const actuals: SpecialActualsInput = {};
    for (const [k, v] of Object.entries(form)) {
      if (typeof v === "string" && v.trim()) {
        (actuals as Record<string, string>)[k] = v.trim();
      }
    }
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
          Introdueix els guanyadors oficials per puntuar les prediccions especials dels participants.
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg text-pitch-300 mb-3">Jugadors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Màxim golejador" value={form.topScorer ?? ""} onChange={(v) => setField("topScorer", v)} />
          <TextInput label="Màxim assistent" value={form.topAssists ?? ""} onChange={(v) => setField("topAssists", v)} />
          <TextInput label="Millor jugador (MVP)" value={form.mvp ?? ""} onChange={(v) => setField("mvp", v)} />
          <TextInput label="Millor jugador jove" value={form.youngMvp ?? ""} onChange={(v) => setField("youngMvp", v)} />
          <TextInput label="Millor porter" value={form.goldenGlove ?? ""} onChange={(v) => setField("goldenGlove", v)} />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-pitch-300 mb-3">Podi i seleccions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TeamSelect label="Campió" value={form.champion ?? ""} teams={allTeams} onChange={(v) => setField("champion", v)} />
          <TeamSelect label="3r lloc" value={form.thirdPlace ?? ""} teams={allTeams} onChange={(v) => setField("thirdPlace", v)} />
          <TeamSelect label="Selecció revelació" value={form.surpriseTeam ?? ""} teams={revelationTeams} onChange={(v) => setField("surpriseTeam", v)} />
          <TeamSelect label="Selecció decepció" value={form.disappointmentTeam ?? ""} teams={top10Teams} onChange={(v) => setField("disappointmentTeam", v)} />
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
}: {
  label: string;
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
        placeholder="Nom i Cognom"
      />
    </div>
  );
}

function TeamSelect({
  label,
  value,
  teams,
  onChange,
}: {
  label: string;
  value: string;
  teams: { code: string; name: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-pitch-300 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        {value && <TeamFlag code={value} size={22} />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-pitch-950 border border-pitch-700 rounded-xl text-sm"
        >
          <option value="">— Sense definir —</option>
          {teams.map((t) => (
            <option key={t.code} value={t.code}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
