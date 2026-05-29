"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inici" },
  { href: "/registre", label: "Registrar-se" },
  { href: "/prediccions", label: "Prediccions" },
  { href: "/classificacio", label: "Classificació" },
  { href: "/regles", label: "Regles" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-pitch-800/50 bg-pitch-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl tracking-wide text-pitch-400">
          ⚽ QUINIELA 2026
        </Link>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {links.map((l) => (
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
        </div>
      </div>
    </nav>
  );
}
