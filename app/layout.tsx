import type { Metadata } from "next";
import { Sora, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gauss Energia — Painel de Gestão",
  description: "Sistema operacional e gestão de usinas fotovoltaicas e clientes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${bebasNeue.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-gauss-green selection:text-ink-1000">
        {children}
      </body>
    </html>
  );
}