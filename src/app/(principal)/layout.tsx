import { EnTeteApp } from "@/app/_composants/EnTeteApp";

export default function LayoutPrincipal({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell">
      <div className="border-b border-bordure px-6 py-4">
        <div className="mx-auto w-full max-w-7xl">
          <EnTeteApp />
        </div>
      </div>
      <main className="app-shell-contenu">
        <div className="app-shell-principal">{children}</div>
      </main>
    </div>
  );
}
