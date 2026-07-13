import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joker",
  description: "Moteur pédagogique universel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
