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

export function promptQuestionsDiagnostic(contexte: ContexteApprentissage): string {
  return `Capacité : diagnostic initial.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Génère exactement 5 questions de diagnostic adaptées au domaine et à l'objectif.
L'ensemble doit cartographier le niveau réel de l'apprenant (pas de note) :
- couvrir différents aspects du domaine liés à l'objectif ;
- progresser en difficulté (du plus accessible au plus exigeant) ;
- questions ouvertes, claires et distinctes (pas de redondance).

Retourne les 5 questions dans l'ordre de présentation.`;
}

export function promptConstruireProfil(contexte: ContexteApprentissage): string {
  return `Capacité : construction du profil apprenant.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

À partir des réponses au diagnostic, construis un profil fidèle du niveau réel de l'apprenant.
Identifie acquis, compétences, lacunes, erreurs fréquentes probables et préférences pédagogiques.
Laisse notionsMaitrisees vide ([]) — ce champ est réservé à la progression dans la roadmap
(il sera géré par le moteur). Mets les connaissances déjà présentes dans acquis/compétences.`;
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

Objectif de l'élève : « ${contexte.objectif.intitule} »

Crée une problématique qui suscite une tension cognitive AVANT toute explication.
Elle doit donner une raison concrète d'apprendre cette notion, en la reliant à l'objectif global.

Génère aussi 3 à 6 cas d'usage (casDusage) : des choses concrètes et réelles que l'élève
pourra faire en atteignant son objectif. Chaque cas d'usage doit :
- avoir un titre court et actionnable (ex. « Faire de bonnes pâtes maison ») ;
- avoir une description d'une phrase qui explique concrètement ce que cela implique ;
- être varié (quotidien, professionnel, créatif, social…) et ancré dans la réalité ;
- montrer comment la notion courante est une étape vers ces usages.

Les cas d'usage prolongent l'objectif de l'élève : ils montrent la portée concrète
de son projet, pas seulement la notion isolée.`;
}

export function promptGenererPlanCours(
  contexte: ContexteApprentissage,
  notion: Notion,
): string {
  return `Capacité : planification d'un cours riche et dynamique.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Conçois un plan de cours adapté au profil de l'apprenant avec 5 à 10 blocs variés.
Types disponibles :
- texte : paragraphes en markdown (titres, listes, gras)
- encadre : info, attention, astuce ou exemple (variante + markdown)
- analogie : source, cible, explication
- comparaison / tableau : entetes + lignes
- schema : briefMedia décrivant le schéma Mermaid à générer ensuite
- graphique : briefMedia décrivant les données à visualiser
- image : briefMedia + alt (illustration pédagogique claire)
- etapes : procédure pas à pas
- quizFlash : question rapide de vérification (2 à 4 options)

Règles :
- Commencer par une accroche, finir par un quizFlash
- Inclure au moins un schema OU graphique ET une image si pertinent
- Les procédures pas-à-pas (etapes) et le quizFlash appartiennent au cours, pas à l'exemple d'expert
- Adapter le ton et la complexité au profil
- Les briefMedia doivent être précis et actionnables pour la génération média
- Chaque intention utilise un schéma PLAT : remplis uniquement les champs utiles selon le type, mets null pour tous les autres champs

Champs par type :
- texte : markdown
- encadre : variante, markdown, titre (optionnel)
- analogie : source, cible, explication
- comparaison / tableau : entetes, lignes, legende (optionnel pour tableau)
- schema / graphique / image : briefMedia, legende (optionnel), alt (obligatoire pour image)
- etapes : etapes (tableau { titre, markdown })
- quizFlash : question, options, bonneReponse, explication`;
}

export function promptGenererSchema(brief: string, contexte?: string): string {
  return `Capacité : génération de schéma Mermaid pédagogique.

${contexte ? `Contexte :\n${contexte}\n\n` : ""}Brief :
${brief}

Génère du code Mermaid valide (flowchart, sequenceDiagram, mindmap, classDiagram…).
Pas de balises markdown. Syntaxe Mermaid uniquement, en français pour les libellés.`;
}

export function promptGenererGraphique(brief: string, contexte?: string): string {
  return `Capacité : spécification de graphique pédagogique.

${contexte ? `Contexte :\n${contexte}\n\n` : ""}Brief :
${brief}

Produis une spécification de graphique avec genre (barres, lignes, aire ou secteurs),
des séries nommées et des points { etiquette, valeur } réalistes et pédagogiques.`;
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

Montre comment un expert utilise cette notion dans une situation réelle et concrète.
Tu t'adresses directement à l'apprenant (tutoiement). Pas de jargon de formateur.

Le champ "contexte" décrit la situation réelle en 1 à 2 phrases (enjeu, lieu, contrainte).
Ce n'est PAS un résumé pédagogique de la notion.

Produis 3 à 5 blocs de démonstration avec UNIQUEMENT ces types :
- texte : narration de la situation, raisonnement ou geste de l'expert (markdown)
- encadre : variante info, attention, astuce ou exemple + markdown (+ titre optionnel)
- analogie : source, cible, explication (pour éclairer un choix d'expert)
- image : briefMedia + alt (illustration de la situation réelle, pas un schéma didactique)

Structure attendue :
1. Mise en situation concrète
2. Raisonnement ou geste expert
3. Point de vigilance ou résultat obtenu

Interdit :
- quizFlash, etapes, schema, graphique, comparaison, tableau
- méta-pédagogie ("Notion N", "apprenants", "utilisation pédagogique")
- noms de fichiers vidéo ou médias inventés
- procédures pas-à-pas à apprendre (réservées au cours)

Champs par type (schéma PLAT : null pour les champs inutiles) :
- texte : markdown
- encadre : variante, markdown, titre (optionnel)
- analogie : source, cible, explication
- image : briefMedia, alt, legende (optionnel)`;
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
  const titresExistants =
    contexte.roadmap?.notions.map((n) => n.titre).join(" | ") ?? "(aucune)";

  return `Capacité : adaptation du parcours.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notions déjà dans la roadmap (conserve ces titres autant que possible pour la continuité) :
${titresExistants}

Fais évoluer le profil et la roadmap selon la progression réelle de l'apprenant.
Ajuste les lacunes, acquis et éventuellement l'ordre/contenu des notions restantes.
Conserve la cohérence des prérequis via prerequisOrdres (indices 0-based).
Pour les notions déjà présentes, réutilise EXACTEMENT le même titre afin de préserver la continuité du parcours.
Le champ notionsMaitrisees du profil généré sera ignoré côté serveur (géré par le moteur).`;
}
