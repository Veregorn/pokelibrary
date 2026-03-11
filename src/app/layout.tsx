import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PokeLibrary — Raúl Jiménez",
  description:
    "Prueba técnica para BinPar: aplicación web para buscar y ver información de Pokémon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <header className="bg-red-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">PokeLibrary</h1>
            <span className="text-2xl">—</span>
            <p className="text-sm">by Raúl Jiménez</p>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
