"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
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

      login({ id: data.id, name: data.name, pin });
      router.push("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar-se");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 text-center mb-2">CREAR COMPTE</h1>
      <p className="text-pitch-300 text-center mb-8">Registra&apos;t a la quiniela del Mundial 2026</p>

      <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-5 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm text-pitch-300 mb-2">El teu nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={30}
            autoComplete="username"
            placeholder="Ex: Joan"
            className="input-field"
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
            autoComplete="new-password"
            placeholder="••••"
            className="input-field"
          />
          <p className="text-xs text-pitch-500 mt-1">El faràs servir per entrar cada vegada</p>
        </div>

        <div>
          <label className="block text-sm text-pitch-300 mb-2">Confirma el PIN</label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            required
            minLength={4}
            autoComplete="new-password"
            placeholder="••••"
            className="input-field"
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
          L&apos;admin et marcarà com a conegut quan t&apos;hagi rebut. Premis: 70% · 20% · 10% per als 3 primers.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Creant compte..." : "Crear compte"}
        </button>

        <p className="text-center text-sm text-pitch-400">
          Ja tens compte?{" "}
          <Link href="/login" className="text-pitch-300 underline hover:text-white">
            Inicia sessió
          </Link>
        </p>
      </form>
    </div>
  );
}
