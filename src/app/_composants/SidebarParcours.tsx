"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ArchiveCycle, EtapeCycle, Roadmap, StatutSession } from "@/core/domain";
import {
  ORDRE_ETAPES,
  etapeCycleVersSlug,
  indexNotionCourante,
  libelleEtape,
  notionsMaitriseesValides,
} from "@/app/_experience/progression";
import { urlEtape } from "@/app/_experience/navigation";

interface SidebarParcoursProps {
  objectifId: string;
  intitule: string;
  statut: StatutSession;
  roadmap: Roadmap | null;
  notionCouranteId: string | null;
  etapeCourante: EtapeCycle | null;
  archive: ArchiveCycle | null;
  notionsMaitrisees: readonly string[];
}

function etapeVisitee(
  archive: ArchiveCycle | null,
  notionId: string,
  etape: EtapeCycle,
): boolean {
  const notion = archive?.notions.find((n) => n.notionId === notionId);
  return notion?.etapes.some((e) => e.etape === etape) ?? false;
}

export function SidebarParcours({
  objectifId,
  intitule,
  statut,
  roadmap,
  notionCouranteId,
  etapeCourante,
  archive,
  notionsMaitrisees,
}: SidebarParcoursProps) {
  const pathname = usePathname();
  const maitriseesValides = notionsMaitriseesValides(notionsMaitrisees, roadmap);
  const indexCourant = indexNotionCourante(roadmap, notionCouranteId);
  const totalNotions = roadmap?.notions.length ?? 0;

  return (
    <aside className="flex flex-col gap-6 border-r border-bordure bg-surface p-5 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-texte-secondaire">
          Parcours
        </p>
        <p className="text-sm font-semibold leading-snug">{intitule}</p>
      </div>

      {(statut === "diagnostic" || statut === "generation") && (
        <nav className="flex flex-col gap-2">
          {statut === "diagnostic" && (
            <Link
              href={`/session/${objectifId}/diagnostic`}
              className={
                pathname.includes("/diagnostic")
                  ? "text-sm font-medium text-accent"
                  : "text-sm text-texte-secondaire"
              }
            >
              Diagnostic
            </Link>
          )}
          {statut === "generation" && (
            <span className="text-sm text-texte-secondaire">
              Préparation du parcours…
            </span>
          )}
        </nav>
      )}

      {statut === "termine" && (
        <Link
          href={`/session/${objectifId}/bilan`}
          className={
            pathname.includes("/bilan")
              ? "text-sm font-medium text-accent"
              : "text-sm text-texte-secondaire hover:text-texte"
          }
        >
          Bilan final
        </Link>
      )}

      {roadmap && totalNotions > 0 && (
        <nav className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-texte-secondaire">
            {indexCourant > 0
              ? `Notion ${indexCourant}/${totalNotions}`
              : `Notions · ${maitriseesValides.length}/${totalNotions} maîtrisées`}
          </p>
          <ul className="flex flex-col gap-3">
            {roadmap.notions.map((notion) => {
              const maitrisee = maitriseesValides.includes(notion.id);
              const courante = notion.id === notionCouranteId;
              const visitée =
                maitrisee || archive?.notions.some((n) => n.notionId === notion.id);

              return (
                <li key={notion.id} className="flex flex-col gap-1.5">
                  <p
                    className={
                      courante
                        ? "text-sm font-semibold text-accent"
                        : maitrisee
                          ? "text-sm font-medium text-succes"
                          : visitée
                            ? "text-sm font-medium text-texte"
                            : "text-sm text-texte-secondaire"
                    }
                  >
                    {notion.titre}
                  </p>

                  {(visitée || courante) && (
                    <ul className="ml-2 flex flex-col gap-1 border-l border-bordure pl-3">
                      {ORDRE_ETAPES.map((etape) => {
                        const href = urlEtape(objectifId, notion.id, etape);
                        const slug = etapeCycleVersSlug(etape);
                        // Inclure notionId : endsWith("/exercices") marquait
                        // toutes les notions à la même étape.
                        const actif = pathname.includes(
                          `/notion/${notion.id}/${slug}`,
                        );
                        const accessible =
                          etapeVisitee(archive, notion.id, etape) ||
                          (courante && etapeCourante === etape);

                        if (!accessible) {
                          return (
                            <li key={etape}>
                              <span className="text-xs text-texte-secondaire opacity-50">
                                {libelleEtape(etape)}
                              </span>
                            </li>
                          );
                        }

                        return (
                          <li key={etape}>
                            <Link
                              href={href}
                              className={
                                actif
                                  ? "text-xs font-medium text-accent"
                                  : "text-xs text-texte-secondaire hover:text-texte"
                              }
                            >
                              {libelleEtape(etape)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </aside>
  );
}
