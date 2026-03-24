import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ÓptiHub — Hub de IA para Óticas | AgentPRO",
  description:
    "IA que transforma sua ótica. Crie artes, edite produtos, experimente armações virtualmente e venda mais — tudo com inteligência artificial.",
  keywords: [
    "ótica",
    "inteligência artificial",
    "marketing ótica",
    "IA para óticas",
    "try-on virtual",
    "AgentPRO",
  ],
  openGraph: {
    title: "ÓptiHub — Hub de IA para Óticas",
    description:
      "IA que transforma sua ótica. Crie artes, edite produtos e venda mais.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
