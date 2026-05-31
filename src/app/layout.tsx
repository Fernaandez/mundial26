import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Quiniela Mundial 2026",
  description: "Quiniela entre amics — Copa del Món FIFA 2026",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#052e16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body className={`${inter.variable} ${bebas.variable} font-body antialiased gradient-pitch`}>
        <AuthProvider>
          <Nav />
          <main className="min-h-screen pb-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
