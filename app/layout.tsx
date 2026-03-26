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
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ÓptiHub — Hub de IA para Óticas",
    description:
      "IA que transforma sua ótica. Crie artes, edite produtos e venda mais.",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ÓptiHub — Hub de IA para Óticas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ÓptiHub — Hub de IA para Óticas",
    description: "IA que transforma sua ótica. Crie artes, edite produtos e venda mais.",
    images: ["/og-image.png"],
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
