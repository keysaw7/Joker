import type {
  ContexteApprentissage,
  DifficulteDiagnostic,
  Exercice,
  FormatExercice,
  NiveauGuidage,
  Notion,
  QuestionDiagnostic,
  ReponseApprenant,
  ReponseDiagnostic,
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
      estimationNiveau: contexte.estimationNiveau,
    },
    null,
    2,
  );
}

export function promptSysteme(): string {
  return PROMPT_SYSTEME;
}

export function promptQuestionDiagnostic(
  contexte: ContexteApprentissage,
  params: {
    difficulteCible: DifficulteDiagnostic;
    competencesDejaCouvertes: readonly string[];
  },
): string {
  return `Capacité : diagnostic adaptatif (une question).

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Génère exactement UNE question de diagnostic ouverte, claire et distincte.
Difficulté cible (1 = très accessible, 5 = exigeant) : ${params.difficulteCible}.
Compétences déjà couvertes (ne pas répéter le même competenceId) : ${
    params.competencesDejaCouvertes.length > 0
      ? params.competencesDejaCouvertes.join(", ")
      : "aucune"
  }.

La question doit :
- cibler une compétence précise du domaine liée à l'objectif ;
- correspondre au niveau de difficulté demandé ;
- permettre d'évaluer la maîtrise réelle (pas de QCM).

Retourne intitule, competenceId (slug stable), competenceLibelle et difficulte (= ${params.difficulteCible}).`;
}

export function promptEvaluerReponseDiagnostic(
  contexte: ContexteApprentissage,
  question: QuestionDiagnostic,
  reponse: ReponseDiagnostic,
): string {
  return `Capacité : évaluation d'une réponse au diagnostic.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Question posée :
${JSON.stringify(question, null, 2)}

Réponse de l'apprenant :
${JSON.stringify(reponse, null, 2)}

Évalue la réponse avec la grille :
- "maitrise" : réponse correcte et suffisamment développée pour le niveau de la question ;
- "partiel" : éléments justes mais lacunes, imprécisions ou incomplet ;
- "absent" : hors-sujet, « je ne sais pas », ou erreur majeure.

Justifie brièvement. Si maitrise ou partiel insuffisant, indique lacuneDetectee (sinon null).`;
}

/** @deprecated Utiliser promptQuestionDiagnostic */
export function promptQuestionsDiagnostic(contexte: ContexteApprentissage): string {
  return promptQuestionDiagnostic(contexte, {
    difficulteCible: 3,
    competencesDejaCouvertes: [],
  });
}

export function promptConstruireProfil(contexte: ContexteApprentissage): string {
  return `Capacité : construction du profil apprenant.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

À partir des réponses au diagnostic et du vecteur estimationNiveau (évaluations structurées),
construis un profil fidèle du niveau réel de l'apprenant.
Identifie acquis, compétences, lacunes, erreurs fréquentes probables et préférences pédagogiques.
Laisse notionsMaitrisees vide ([]) — ce champ est géré par le moteur après la roadmap.
Mets les connaissances déjà présentes dans acquis/compétences.`;
}

export function promptGenererRoadmap(contexte: ContexteApprentissage): string {
  return `Capacité : planification pédagogique.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Découpe l'objectif en une succession ordonnée de notions à apprendre.
Chaque notion doit avoir des objectifs pédagogiques et des critères de maîtrise mesurables.
Utilise prerequisOrdres pour indiquer les indices (0-based) des notions prérequises dans le tableau notions.
Génère entre 3 et 8 notions selon la complexité de l'objectif.

Le contexte contient estimationNiveau (scores par compétence et évaluations) :
- priorise les notions qui comblent les lacunes ;
- mets **toujours** maitriseInitiale à false pour chaque notion (la maîtrise est validée uniquement par le cycle d'exercices, pas par le diagnostic).`;
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
- avoir un titre court et actionnable (ex. « Tenir une conversation simple au konbini ») ;
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
  return `Capacité : rédaction du cours affiché à l'élève (leçon complète, pas un syllabus).

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Objectif de l'élève : « ${contexte.objectif.intitule} »

Rédige le cours que l'élève lira à l'écran : explications, exemples concrets, chiffres ou ratios quand pertinent.
Couvre les objectifsPedagogiques et prépare aux criteresDeMaitrise de la notion.

Structure obligatoire (5 à 10 blocs variés) :
1. Accroche (texte ou encadre) — pourquoi c'est utile pour l'objectif
2. Explication(s) dense(s) — enseigne vraiment (définitions, quantités, méthode)
3. Supports (analogie, comparaison, tableau, schema, graphique, image) au service de la compréhension
4. Procédure pas à pas (etapes) si la notion est pratique
5. Synthèse courte (texte ou encadre)
6. Dernier bloc : quizFlash (2 à 4 options + explication)

Interdit :
- Titres ou contenus « Plan de cours… », « Bloc 1 : », « Objectif / Public / Structure »
- Listes de « Fiche pratique N : » sans paragraphes explicatifs
- Phrases vides du type « on verra », « ce bloc présente » — enseigne directement

Types disponibles :
- texte : markdown riche (titres ##, listes, gras) — minimum ~3 phrases utiles par bloc texte
- encadre : info, attention, astuce ou exemple (variante + markdown développé)
- analogie : source, cible, explication
- comparaison / tableau : entetes + lignes
- schema : briefMedia précis pour génération Mermaid ensuite
- graphique : briefMedia pour visualisation de données
- image : briefMedia + alt (illustration pédagogique)
- etapes : chaque étape avec titre + markdown actionnable
- quizFlash : question, options, bonneReponse, explication

Règles :
- titre du JSON = titre de leçon clair (proche de la notion), jamais « Plan de… »
- Au moins un schema OU graphique ET une image si pertinent
- Les briefMedia doivent être précis et actionnables
- Schéma PLAT JSON : champs utiles selon le type, null pour les autres

Champs par type :
- texte : markdown
- encadre : variante, markdown, titre (optionnel)
- analogie : source, cible, explication
- comparaison / tableau : entetes, lignes, legende (optionnel pour tableau)
- schema / graphique / image : briefMedia, legende (optionnel), alt (obligatoire pour image)
- etapes : etapes (tableau { titre, markdown })
- quizFlash : question, options, bonneReponse, explication`;
}

export function promptReparerPlanCours(
  contexte: ContexteApprentissage,
  notion: Notion,
  defauts: readonly string[],
  planInvalide: { titre: string; intentions: readonly unknown[] },
): string {
  return `${promptGenererPlanCours(contexte, notion)}

Le brouillon suivant a été rejeté par la garde qualité :
${JSON.stringify(planInvalide, null, 2)}

Défauts à corriger impérativement :
${defauts.map((d) => `- ${d}`).join("\n")}

Regénère un cours complet corrigé (même schéma JSON), en enseignant réellement — pas un plan pour formateur.`;
}

export function promptGenererSchema(brief: string, contexte?: string): string {
  return `Capacité : génération de schéma Mermaid pédagogique.

${contexte ? `Contexte :\n${contexte}\n\n` : ""}Brief :
${brief}

Préfère un flowchart TD ou LR simple (5 à 8 nœuds max).
Règles de syntaxe strictes :
- Pas de balises markdown
- Libellés en français entre guillemets doubles si espaces ou caractères spéciaux : A["Calcul des quantités"]
- Évite les parenthèses non échappées dans les libellés ; utilise des guillemets
- Pas de point-virgule superflu en fin de ligne
- Syntaxe Mermaid uniquement, une seule déclaration de diagramme`;
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
  format: FormatExercice,
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

Format imposé (respecte STRICTEMENT ce format dans le champ format) : ${format}
Champs à remplir selon le format (mets null pour tous les autres) :
- qcm : question, options (2-6), bonneReponse (index 0-based) ; phrases/paires/enonce/criteres/aide/distracteurs = null
- trous : phrases[{ id, texteAvecTrous avec exactement un marqueur ___, solutions[] }] ; question/options/bonneReponse/paires/enonce/… = null
- appariement : paires[{ id, gauche, droite }], distracteurs optionnels ou null ; le reste = null
- production_libre : enonce, criteres optionnels, aide optionnelle ; le reste = null

Crée UN exercice dans ce format exact, adapté au profil et au guidage.
Remplis cibleLacune avec null sauf remédiation.`;
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
  itemsJson?: string,
): string {
  return `Capacité : correction personnalisée.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Exercice :
${JSON.stringify(exercice, null, 2)}

Analyse de la réponse :
${analyseJson}

${itemsJson ? `Détail d'évaluation (items) :\n${itemsJson}\n` : ""}
Rédige un feedback pédagogique structuré :
- resume : explication bienveillante et claire (pas un mur de texte)
- pointsForts : liste courte des réussites (ou null)
- aRetravailler : liste courte des points à retravailler (ou null)`;
}

export function promptRemediation(
  contexte: ContexteApprentissage,
  notion: Notion,
  lacune: string,
  format: FormatExercice,
): string {
  return `Capacité : remédiation ciblée.

Contexte d'apprentissage :
${serialiserContexte(contexte)}

Notion cible :
${JSON.stringify(notion, null, 2)}

Lacune à combler : ${lacune}

Format imposé : ${format}
Guidage : fort (cibleLacune doit reprendre la lacune).
Mets null pour les champs non pertinents au format (schéma plat).

Génère UN exercice dans ce format exact, ciblant précisément cette lacune.`;
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
