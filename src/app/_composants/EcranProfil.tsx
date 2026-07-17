import type { ProfilEleve } from "@/core/domain";
import { DOMAINES } from "@/app/_data/domaines";
import { BarreProgression } from "@/app/_composants/BarreProgression";
import { Carte } from "@/app/_composants/Carte";

interface EcranProfilProps {
  profil: ProfilEleve;
}

function libelleTypeMemoire(type: ProfilEleve["typeMemoire"]): string {
  if (!type) {
    return "Bientôt déterminé par l'IA";
  }

  const libelles: Record<NonNullable<ProfilEleve["typeMemoire"]>, string> = {
    visuelle: "Visuelle",
    auditive: "Auditive",
    litteraire: "Littéraire",
    kinesthesique: "Kinesthésique",
  };

  return libelles[type];
}

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SectionListe({
  titre,
  elements,
  placeholder,
}: {
  titre: string;
  elements: readonly string[];
  placeholder: string;
}) {
  return (
    <Carte>
      <h2 className="mb-3 text-sm font-medium text-texte-secondaire">
        {titre}
      </h2>
      {elements.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {elements.map((element) => (
            <li key={element} className="text-sm">
              {element}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-texte-secondaire">{placeholder}</p>
      )}
    </Carte>
  );
}

export function EcranProfil({ profil }: EcranProfilProps) {
  const sessionsActives = profil.competencesParDomaine.some(
    (competence) => competence.objectifsTotal > 0,
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">Profil</p>
        <h1 className="text-2xl font-semibold">Mon profil de compétences</h1>
        <p className="text-texte-secondaire">
          {profil.email ?? "Compte connecté"} — mis à jour le {formaterDate(profil.miseAJour)}
        </p>
      </header>

      {!sessionsActives ? (
        <Carte>
          <p className="text-texte-secondaire">
            Commencez un parcours pour construire votre profil. L&apos;IA enrichira
            progressivement vos particularités d&apos;apprentissage.
          </p>
        </Carte>
      ) : null}

      <Carte>
        <h2 className="mb-2 text-sm font-medium text-texte-secondaire">
          Type de mémoire
        </h2>
        <p className="text-lg font-medium">{libelleTypeMemoire(profil.typeMemoire)}</p>
      </Carte>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionListe
          titre="Points forts"
          elements={profil.pointsForts}
          placeholder="Bientôt déterminé par l'IA"
        />
        <SectionListe
          titre="Points faibles"
          elements={profil.pointsFaibles}
          placeholder="Bientôt déterminé par l'IA"
        />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Compétences en japonais</h2>
        {DOMAINES.map((domaine) => {
          const competence = profil.competencesParDomaine.find(
            (item) => item.domaineId === domaine.id,
          );
          if (!competence) {
            return null;
          }

          const pourcentage =
            competence.notionsTotal > 0
              ? Math.round(
                  (competence.notionsMaitrisees / competence.notionsTotal) * 100,
                )
              : 0;

          return (
            <Carte key={domaine.id}>
              <div className="mb-4 flex flex-col gap-1">
                <h3 className="font-medium">{domaine.nom}</h3>
                <p className="text-sm text-texte-secondaire">
                  {competence.objectifsTotal} objectif
                  {competence.objectifsTotal > 1 ? "s" : ""}
                  {competence.niveau !== null
                    ? ` — niveau estimé : ${competence.niveau}/100`
                    : " — niveau bientôt estimé par l'IA"}
                </p>
              </div>

              {competence.notionsTotal > 0 ? (
                <BarreProgression
                  libelle={`${competence.notionsMaitrisees} / ${competence.notionsTotal} notions maîtrisées`}
                  pourcentage={pourcentage}
                />
              ) : (
                <p className="text-sm text-texte-secondaire">
                  Aucune notion parcourue pour l&apos;instant.
                </p>
              )}

              {competence.lacunes.length > 0 ? (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-sm font-medium text-texte-secondaire">
                    Lacunes identifiées
                  </p>
                  <ul className="flex flex-col gap-2">
                    {competence.lacunes.map((lacune) => (
                      <li key={lacune.sujet} className="text-sm">
                        <span className="font-medium">{lacune.sujet}</span>
                        {" — "}
                        {lacune.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Carte>
          );
        })}
      </section>

      <SectionListe
        titre="Préférences pédagogiques observées"
        elements={profil.preferencesPedagogiques}
        placeholder="Les préférences apparaîtront au fil de vos parcours."
      />
    </div>
  );
}
