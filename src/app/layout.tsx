import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joker",
  description: "Apprendre le japonais avec un parcours adapté à ton objectif",
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
