"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      login({ id: data.id, name: data.name, pin });
      router.push("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en iniciar sessió");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="font-display text-4xl sm:text-5xl text-pitch-400 text-center mb-2">INICIAR SESSIÓ</h1>
      <p className="text-pitch-300 text-center mb-8">Entra amb el teu nom i PIN</p>

      <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-5 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm text-pitch-300 mb-2">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="username"
            placeholder="El teu nom"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm text-pitch-300 mb-2">PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••"
            className="input-field"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Entrant..." : "Entrar"}
        </button>

        <p className="text-center text-sm text-pitch-400">
          No tens compte?{" "}
          <Link href="/registre" className="text-pitch-300 underline hover:text-white">
            Registra&apos;t
          </Link>
        </p>
      </form>
    </div>
  );
}
