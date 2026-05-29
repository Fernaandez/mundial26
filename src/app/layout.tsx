import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Quiniela Mundial 2026",
  description: "Quiniela entre amics — Copa del Món FIFA 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body className={`${inter.variable} ${bebas.variable} font-body antialiased gradient-pitch`}>
        <Nav />
        <main className="min-h-screen pb-16">{children}</main>
      </body>
    </html>
  );
}
