"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const publicLinks = [
    { href: "/", label: "Inici" },
    { href: "/torneig", label: "Torneig" },
    { href: "/classificacio", label: "Classificació" },
    { href: "/regles", label: "Regles" },
  ];

  const userLinks = [
    { href: "/perfil", label: "Perfil" },
    { href: "/prediccions", label: "Prediccions" },
    { href: "/prediccions/altres", label: "La gent" },
    { href: "/torneig", label: "Torneig" },
    { href: "/classificacio", label: "Classificació" },
    { href: "/regles", label: "Regles" },
  ];

  const links = user ? userLinks : publicLinks;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    router.push("/");
    setMenuOpen(false);
  }

  function linkClass(href: string, primary = false) {
    const active = pathname === href;
    if (primary) {
      return `block w-full text-center px-4 py-3 rounded-xl font-semibold ${
        active ? "bg-pitch-500 text-white" : "bg-pitch-600 text-white"
      }`;
    }
    return `block w-full px-4 py-3 rounded-xl text-base font-medium ${
      active ? "bg-pitch-600 text-white" : "text-pitch-200 hover:bg-pitch-900"
    }`;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-pitch-800/50 bg-pitch-950/95 backdrop-blur-md safe-top">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href={user ? "/perfil" : "/"}
          className="font-display text-xl sm:text-2xl tracking-wide text-pitch-400 shrink-0"
        >
          ⚽ QUINIELA 2026
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex flex-wrap items-center justify-end gap-1 lg:gap-2">
          {!loading &&
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-pitch-600 text-white"
                    : "text-pitch-300 hover:text-white hover:bg-pitch-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  pathname === "/login" ? "bg-pitch-600 text-white" : "text-pitch-300 hover:text-white hover:bg-pitch-900"
                }`}
              >
                Entrar
              </Link>
              <Link href="/registre" className="btn-primary text-sm py-1.5 px-3">
                Registrar-se
              </Link>
            </>
          )}
          {!loading && user && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-pitch-400 hover:text-white hover:bg-pitch-900"
            >
              Sortir
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-pitch-900 border border-pitch-700 text-pitch-200 text-xl"
          aria-label={menuOpen ? "Tancar menú" : "Obrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[57px] bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="md:hidden fixed left-0 right-0 top-[57px] z-50 bg-pitch-950 border-b border-pitch-800 shadow-xl max-h-[calc(100dvh-57px)] overflow-y-auto safe-bottom">
            <div className="p-4 space-y-2">
              {!loading &&
                links.map((l) => (
                  <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                    {l.label}
                  </Link>
                ))}
              {!loading && !user && (
                <>
                  <Link href="/login" className={linkClass("/login")}>
                    Entrar
                  </Link>
                  <Link href="/registre" className={linkClass("/registre", true)}>
                    Registrar-se
                  </Link>
                </>
              )}
              {!loading && user && (
                <button type="button" onClick={handleLogout} className={linkClass("")}>
                  Tancar sessió
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
