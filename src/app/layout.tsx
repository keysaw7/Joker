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
      <body className="flex min-h-screen flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
