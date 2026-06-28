"use client";

import { useState } from "react";
import type { SpecialActualsInput } from "@/lib/scoring";

interface AdminSpecialActualsFormProps {
  initial: SpecialActualsInput;
  adminPin: string;
  onSaved: () => void;
}

function codesToString(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "string") return v;
  return "";
}

export function AdminSpecialActualsForm({ initial, adminPin, onSaved }: AdminSpecialActualsFormProps) {
  const [form, setForm] = useState<SpecialActualsInput>({
    topScorer: initial.topScorer ?? "",
    topAssists: initial.topAssists ?? "",
    mvp: initial.mvp ?? "",
    youngMvp: initial.youngMvp ?? "",
    goldenGlove: initial.goldenGlove ?? "",
    surpriseTeam: initial.surpriseTeam ?? "",
    disappointmentTeam: initial.disappointmentTeam ?? "",
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
