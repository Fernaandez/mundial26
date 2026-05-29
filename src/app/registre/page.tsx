"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pin !== confirmPin) {
      setError("Els PINs no coincideixen");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("quiniela_user", JSON.stringify({ id: data.id, name: data.name, pin }));
      router.push("/prediccions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar-se");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-display text-5xl text-pitch-400 text-center mb-2">REGISTRE</h1>
      <p className="text-pitch-300 text-center mb-8">Uneix-te a la quiniela del Mundial 2026</p>

      <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm text-pitch-300 mb-2">El teu nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={30}
            placeholder="Ex: Joan"
            className="w-full px-4 py-3 bg-pitch-950 border border-pitch-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pitch-500"
          />
        </div>

        <div>
          <label className="block text-sm text-pitch-300 mb-2">PIN personal (mín. 4 caràcters)</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            minLength={4}
            placeholder="••••"
            className="w-full px-4 py-3 bg-pitch-950 border border-pitch-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pitch-500"
          />
          <p className="text-xs text-pitch-500 mt-1">El necessitaràs per fer i editar les teves prediccions</p>
        </div>

        <div>
          <label className="block text-sm text-pitch-300 mb-2">Confirma el PIN</label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            required
            minLength={4}
            placeholder="••••"
            className="w-full px-4 py-3 bg-pitch-950 border border-pitch-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pitch-500"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-pitch-900/50 rounded-xl p-4 text-sm text-pitch-300">
          <strong className="text-pitch-200">Quota:</strong> 15€ per persona
          <br />
          L&apos;admin marcarà quan hagis pagat. Premis: 50% · 30% · 20% per als 3 primers.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Registrant..." : "Registrar-me"}
        </button>
      </form>
    </div>
  );
}
