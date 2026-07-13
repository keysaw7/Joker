import type {
  ContexteApprentissage,
  Exercice,
  NiveauGuidage,
  Notion,
  ReponseApprenant,
} from "@/core/domain";

const PROMPT_SYSTEME = `Tu es un moteur pédagogique expert intégré à l'application Joker.
Tu adaptes le contenu au profil de l'apprenant et à son objectif.
Tu ne fabriques pas de faits : tu structures, reformules et organises des connaissances de manière pédagogique.
Réponds en français, avec clarté et précision.
Respecte strictement le schéma JSON demandé.`;

export function serialiserContexte(contexte: ContexteApprentissage): string {
  return JSON.stringify(
    {
      domaine: contexte.domaine,
      objectif: contexte.objectif,
      profil: contexte.profil,
      roadmap: contexte.roadmap,
      notionCouranteId: contexte.notionCouranteId,
      reponsesDiagnostic: contexte.reponsesDiagnostic,
    },
    null,
    2,
  );
}

export function promptSysteme(): string {
  return PROMPT_SYSTEME;
}

export function promptQuestionDiagnostic(contexte: ContexteApprentissage): string {
  return `Capacité : diagnostic initial.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Génère une question de diagnostic adaptée au domaine et à l'objectif.
La question doit évaluer le niveau réel de l'apprenant, pas attribuer une note.
Évite de répéter une question déjà posée (voir reponsesDiagnostic).
Pose une seule question claire et ouverte.`;
}

export function promptConstruireProfil(contexte: ContexteApprentissage): string {
  return `Capacité : construction du profil apprenant.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

À partir des réponses au diagnostic, construis un profil fidèle du niveau réel de l'apprenant.
Identifie acquis, compétences, lacunes, erreurs fréquentes probables et préférences pédagogiques.
Les notionsMaitrisees doivent refléter ce que l'apprenant maîtrise déjà selon ses réponses.`;
}

export function promptGenererRoadmap(contexte: ContexteApprentissage): string {
  return `Capacité : planification pédagogique.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Découpe l'objectif en une succession ordonnée de notions à apprendre.
Chaque notion doit avoir des objectifs pédagogiques et des critères de maîtrise mesurables.
Utilise prerequisOrdres pour indiquer les indices (0-based) des notions prérequises dans le tableau notions.
Génère entre 3 et 8 notions selon la complexité de l'objectif.`;
}

export function promptGenererProblematique(
  contexte: ContexteApprentissage,
  notion: Notion,
): string {
  return `Capacité : problématique d'accroche.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Crée une problématique qui suscite une tension cognitive AVANT toute explication.
Elle doit donner une raison concrète d'apprendre cette notion.`;
}

export function promptGenererCours(
  contexte: ContexteApprentissage,
  notion: Notion,
): string {
  return `Capacité : génération de cours.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Rédige un cours clair, structuré et adapté au profil de l'apprenant.
Utilise des blocs de contenu variés (texte, analogie, comparaison, schema, etc.) quand c'est pertinent.
Le format "texte" contient du markdown simple si besoin.`;
}

export function promptGenererExempleExpert(
  contexte: ContexteApprentissage,
  notion: Notion,
): string {
  return `Capacité : exemple d'expert.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Montre comment un expert utilise cette notion dans une situation réelle.
La démonstration doit être concrète et inspirante.`;
}

export function promptGenererExercice(
  contexte: ContexteApprentissage,
  notion: Notion,
  guidage: NiveauGuidage,
): string {
  return `Capacité : génération d'exercice.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Niveau de guidage demandé : ${guidage}
- fort : indices nombreux, étapes guidées
- modere : quelques indices
- autonome : l'apprenant doit raisonner seul

Crée un exercice adapté au profil et au niveau de guidage.`;
}

export function promptAnalyserReponse(
  contexte: ContexteApprentissage,
  exercice: Exercice,
  reponse: ReponseApprenant,
): string {
  return `Capacité : analyse d'erreurs.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Exercice :
${JSON.stringify(exercice, null, 2)}

Réponse de l'apprenant :
${JSON.stringify(reponse, null, 2)}

Analyse si la réponse est correcte. Si elle est incorrecte, identifie pourquoi,
quelle connaissance manque, quelle confusion ou erreur cognitive est en jeu.`;
}

export function promptCorriger(
  contexte: ContexteApprentissage,
  exercice: Exercice,
  analyseJson: string,
): string {
  return `Capacité : correction personnalisée.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Exercice :
${JSON.stringify(exercice, null, 2)}

Analyse de la réponse :
${analyseJson}

Rédige une explication personnalisée, bienveillante et pédagogique,
adaptée au profil de l'apprenant.`;
}

export function promptRemediation(
  contexte: ContexteApprentissage,
  notion: Notion,
  lacune: string,
): string {
  return `Capacité : remédiation ciblée.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Lacune à combler : ${lacune}

Génère un exercice ciblant précisément cette lacune, avec un guidage fort.`;
}

export function promptAdaptation(contexte: ContexteApprentissage): string {
  return `Capacité : adaptation du parcours.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Fais évoluer le profil et la roadmap selon la progression réelle de l'apprenant.
Ajuste les lacunes, acquis et l'ordre/contenu des notions si nécessaire.
Conserve la cohérence des prérequis via prerequisOrdres (indices 0-based).`;
}
