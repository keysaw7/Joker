"use client";

import type { SpecGraphique } from "@/core/domain";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COULEURS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

interface GraphiqueViewProps {
  graphique: SpecGraphique;
}

function preparerDonnees(graphique: SpecGraphique) {
  const etiquettes = graphique.series[0]?.points.map((p) => p.etiquette) ?? [];
  return etiquettes.map((etiquette, index) => {
    const point: Record<string, string | number> = { etiquette };
    for (const serie of graphique.series) {
      point[serie.nom] = serie.points[index]?.valeur ?? 0;
    }
    return point;
  });
}

function preparerSecteurs(graphique: SpecGraphique) {
  const serie = graphique.series[0];
  if (!serie) return [];
  return serie.points.map((p) => ({ nom: p.etiquette, valeur: p.valeur }));
}

export function GraphiqueView({ graphique }: GraphiqueViewProps) {
  const donnees = preparerDonnees(graphique);
  const secteurs = preparerSecteurs(graphique);

  return (
    <div className="flex flex-col gap-2">
      {graphique.titre && (
        <p className="text-sm font-medium text-texte">{graphique.titre}</p>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {graphique.genre === "barres" ? (
            <BarChart data={donnees}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bordure)" />
              <XAxis dataKey="etiquette" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {graphique.series.map((serie, i) => (
                <Bar key={serie.nom} dataKey={serie.nom} fill={COULEURS[i % COULEURS.length]} />
              ))}
            </BarChart>
          ) : graphique.genre === "lignes" ? (
            <LineChart data={donnees}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bordure)" />
              <XAxis dataKey="etiquette" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {graphique.series.map((serie, i) => (
                <Line
                  key={serie.nom}
                  type="monotone"
                  dataKey={serie.nom}
                  stroke={COULEURS[i % COULEURS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          ) : graphique.genre === "aire" ? (
            <AreaChart data={donnees}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bordure)" />
              <XAxis dataKey="etiquette" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {graphique.series.map((serie, i) => (
                <Area
                  key={serie.nom}
                  type="monotone"
                  dataKey={serie.nom}
                  fill={COULEURS[i % COULEURS.length]}
                  stroke={COULEURS[i % COULEURS.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          ) : (
            <PieChart>
              <Pie data={secteurs} dataKey="valeur" nameKey="nom" cx="50%" cy="50%" outerRadius={80}>
                {secteurs.map((_, i) => (
                  <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      {graphique.axeX && (
        <p className="text-center text-xs text-texte-secondaire">
          {graphique.axeX}
        </p>
      )}
    </div>
  );
}
