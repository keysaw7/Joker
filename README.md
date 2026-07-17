# Joker — Moteur pédagogique universel

> Ce document est la **Constitution du projet**.
> Toute décision de conception, de code ou de produit doit rester cohérente avec lui.
> Si une idée entre en conflit avec ce document, c'est l'idée qui doit être remise en question — ou ce document mis à jour explicitement et collectivement.

---

## 0. Fondations

Ce produit devra pouvoir évoluer pendant des années sans devenir une cathédrale difficile à maintenir.

Notre priorité absolue est de construire des **fondations solides** : une architecture simple, élégante, modulaire et évolutive.

Règles non négociables :

- Ne jamais anticiper tous les besoins futurs par de la **complexité prématurée**.
- Chaque abstraction n'existe que parce qu'elle répond à un **besoin réel et présent**, jamais parce qu'elle pourrait être utile un jour.
- Nous ne développons pas vite. Nous développons **bien**.

---

## 1. Vision

Joker n'est pas une plateforme de cours.
Ce n'est pas un LMS.
Ce n'est pas un chatbot.
Ce n'est pas « ChatGPT avec une belle interface ».

Joker est un **moteur pédagogique universel**.

Sa promesse :

> Permettre à n'importe qui d'apprendre n'importe quel domaine de la manière la plus efficace possible.

Le domaine peut être les mathématiques, le japonais, la cuisine, la programmation, la physique, la musique, le droit, l'histoire, le marketing, ou absolument n'importe quoi d'autre.

**Le moteur reste toujours identique. Seul le contenu change.**

L'intelligence du système ne réside pas dans les connaissances elles-mêmes, mais dans sa **capacité à construire le meilleur parcours d'apprentissage possible**.

---

## 2. Mission

Construire des fondations solides pour un moteur capable d'évoluer pendant des années sans devenir une cathédrale ingérable.

Priorités, dans l'ordre :

1. Qualité de l'apprentissage de l'élève.
2. Simplicité et lisibilité de l'architecture.
3. Évolutivité et maintenabilité.
4. Vitesse de développement (en dernier).

---

## 3. Philosophie

L'utilisateur ne vient pas consulter du contenu. **Il vient apprendre.**

Chaque décision doit être passée au filtre d'une seule question :

> « Est-ce que cette décision améliore réellement l'apprentissage de l'élève ? »

Si la réponse est non, la fonctionnalité n'a probablement pas sa place.

Principes directeurs :

- Le moteur ne cherche pas à impressionner. Il cherche à **enseigner**.
- L'interface doit **disparaître** au profit de l'expérience d'apprentissage.
- L'utilisateur ne doit jamais avoir l'impression d'utiliser une IA. Il doit avoir l'impression d'avoir **le meilleur professeur possible**.

---

## 4. Principes pédagogiques

Chaque décision est guidée par les **sciences cognitives**, la **pédagogie moderne** et la **psychologie de l'apprentissage**.

Le moteur s'appuie notamment sur :

| Principe | Application dans Joker |
|---|---|
| **Tension cognitive** | La problématique suscite la curiosité *avant* toute explication. |
| **Scaffolding** (étayage) | Les exercices progressent du fort guidage vers l'autonomie. |
| **Apprentissage actif** | L'élève produit des réponses, pas seulement du contenu passif. |
| **Feedback immédiat et ciblé** | Chaque erreur déclenche une analyse, une correction personnalisée, puis un exercice de remédiation. |
| **Mise en contexte** | L'exemple d'expert montre la connaissance en situation réelle. |
| **Maîtrise avant progression** | Le cycle ne s'achève que lorsque les critères de maîtrise sont atteints, pas lorsqu'une série d'exercices est terminée. |
| **Personnalisation continue** | Le profil d'apprenant et la roadmap évoluent en permanence selon la progression réelle. |

Ces principes ne sont pas des fonctionnalités à cocher. Ce sont des **contraintes de conception** : toute étape du Cycle doit les respecter.

---

## 5. Ce que Joker EST / N'EST PAS

| Joker EST | Joker N'EST PAS |
|---|---|
| Un moteur qui construit des parcours | Une bibliothèque de contenus figés |
| Un professeur invisible | Un chatbot avec lequel on discute |
| Adaptatif et personnalisé | Un cours identique pour tous |
| Indépendant des modèles d'IA | Une surcouche d'un fournisseur d'IA |
| Piloté par la pédagogie | Piloté par la technologie |

---

## 6. Le rôle de l'IA

**L'IA n'est jamais l'interface. Elle agit uniquement en arrière-plan. Elle est invisible.**

Elle intervient pour :

- analyser le niveau de l'élève,
- construire un parcours personnalisé,
- sélectionner les connaissances pertinentes,
- générer les contenus pédagogiques,
- créer les exercices,
- analyser les erreurs,
- adapter les explications,
- faire évoluer le parcours.

L'utilisateur n'a **jamais** besoin de « discuter avec l'IA ». Il suit simplement un parcours parfaitement construit.

Plusieurs modèles d'IA pourront collaborer pour produire les différents formats de contenu (texte, schéma, exercice…). L'utilisateur ne perçoit **qu'une seule expérience cohérente**.

---

## 7. Le parcours utilisateur (le Cycle)

L'expérience est organisée en **cycles**. Chaque cycle correspond à l'acquisition d'**une notion**.

### 7.1. Accueil

Présentation rapide du produit. L'utilisateur choisit un **domaine** : mathématiques, japonais, cuisine, programmation, etc.

### 7.2. Objectifs

L'utilisateur peut reprendre un objectif existant ou en créer un nouveau.

Exemples :

- Réussir le JLPT N5
- Comprendre les dérivées
- Maîtriser les sauces françaises
- Apprendre React

Une fois créé, l'objectif devient le **contexte principal** de toute la progression.

### 7.3. Diagnostic

Le moteur cherche à comprendre l'élève. Il ne cherche **pas** à lui attribuer une note. Il construit une **représentation fidèle de son niveau réel** :

- connaissances acquises,
- compétences maîtrisées,
- lacunes,
- erreurs fréquentes,
- incompréhensions,
- préférences pédagogiques.

Les questions sont générées **une à une**, de façon adaptative : chaque réponse est évaluée (maîtrise / partiel / absent) sur une compétence ciblée, ce qui oriente la difficulté de la question suivante et une estimation interne (score 0–100, non affichée comme « note » à l'élève).

Le diagnostic s'arrête lorsque l'estimation est suffisamment fiable (entre 3 et 8 questions), puis alimente le profil, la roadmap (notions prioritaires ou pré-acquises) et le guidage initial du Cycle.

### 7.4. Génération du programme *(invisible)*

À partir de l'objectif et du niveau, le moteur construit une **roadmap** : une succession de **notions**, chacune avec ses **prérequis**, ses **objectifs pédagogiques** et ses **critères de maîtrise**.

Cette roadmap reste **évolutive** : elle sera adaptée en permanence selon la progression réelle de l'élève.

### 7.5. Problématique

Avant chaque nouvelle notion, le moteur crée une **tension cognitive** : une raison d'apprendre (question, problème, défi, situation réelle, objectif concret). Susciter la curiosité **avant** toute explication.

### 7.6. Cours

Le **cœur du produit**. Page extrêmement claire, lisible, épurée.

Le moteur choisit automatiquement les meilleurs supports pédagogiques selon la notion, le domaine et le profil de l'élève :

texte, image, schéma, diagramme, graphique, tableau, vidéo, animation, simulation, comparaison, analogie.

L'utilisateur ne perçoit **qu'un seul cours cohérent**.

### 7.7. Exemple d'expert

Une fois la notion comprise, le moteur montre comment un expert utilise réellement cette connaissance :

- **Japonais** — construction complète d'une phrase réelle.
- **Cuisine** — réalisation d'une recette utilisant précisément la technique étudiée.
- **Mathématiques** — résolution d'un problème réel.

Le but : montrer la connaissance **en contexte**.

### 7.8. Exercices

L'autre pilier du moteur. Entièrement **adaptatifs**, avec une progression du **fort guidage** vers l'**autonomie**.

Après chaque réponse, le moteur analyse :

- si la réponse est correcte,
- pourquoi elle est correcte ou incorrecte,
- quelle connaissance manque,
- quelle confusion est présente,
- quelle erreur cognitive est responsable.

Il produit ensuite une **correction personnalisée**, puis génère un **nouvel exercice ciblant précisément le point bloquant**.

Le cycle continue jusqu'à **disparition de la difficulté**.

L'objectif n'est pas de terminer une série d'exercices. L'objectif est de **supprimer les erreurs de compréhension**.

### 7.9. Récompense

Lorsque la notion est maîtrisée, le moteur valorise la progression (gamification : progression, statistiques, récompenses, badges, encouragements). Puis le cycle recommence avec la notion suivante.

---

## 8. La Bible du domaine

Chaque domaine possède une **Bible** : un document de référence **validé par des experts**.

Elle contient notamment :

- les connaissances,
- les concepts,
- les définitions,
- les prérequis,
- les dépendances entre notions,
- les bonnes pratiques.

La Bible est la **source principale** du moteur.

**L'IA n'invente pas les connaissances.** Elle **sélectionne** les informations pertinentes, les **adapte**, les **reformule**, les **organise**, puis construit des expériences pédagogiques à partir de cette base fiable. Cela réduit fortement les hallucinations.

**Fallback :** tant qu'aucune Bible n'existe pour un domaine, le moteur fonctionne **sans Bible** (l'IA génère à partir de ses connaissances générales). La Bible est une **source branchable**, jamais une dépendance obligatoire. Cela permet de tester le moteur immédiatement.

---

## 9. Génération intelligente (just-in-time)

Une fois l'objectif et le diagnostic réalisés, le moteur possède déjà **la majorité des informations nécessaires**.

- Il ne reconstruit **jamais** l'intégralité du parcours à chaque étape.
- Il produit **uniquement ce qui est nécessaire, au moment où cela devient utile**.
- Chaque page **consomme** les informations produites précédemment (un **contexte d'apprentissage** qui s'enrichit au fil du cycle).

Bénéfices : coûts d'IA maîtrisés, mémoire réduite, meilleure vitesse, personnalisation permanente.

---

## 10. Un moteur indépendant des modèles d'IA

Les modèles d'IA évolueront, changeront, disparaîtront. **Le moteur doit leur survivre.**

Règle absolue :

> L'architecture est pensée autour de **capacités métier**, jamais autour de fournisseurs ou de modèles.

Capacités métier :

| Capacité | Rôle |
|---|---|
| `diagnostic` | Construire la représentation du niveau réel de l'élève |
| `planification pédagogique` | Générer et adapter la roadmap |
| `génération de contenu` | Produire cours, problématiques, exemples d'expert |
| `génération d'exercices` | Créer des exercices adaptatifs ciblés |
| `correction` | Analyser une réponse et produire une explication personnalisée |
| `analyse des erreurs` | Identifier lacunes, confusions et erreurs cognitives |
| `remédiation` | Générer un exercice ciblant un point bloquant précis |
| `adaptation` | Faire évoluer le parcours selon la progression réelle |

Chaque capacité est un **contrat (port)**. Elle peut être implémentée par un ou plusieurs modèles, aujourd'hui comme demain.

**Remplacer GPT, Claude, Gemini ou tout autre modèle ne doit jamais nécessiter de modifier le cœur du moteur.**

---

## 11. Grands composants du moteur

Le moteur se décompose en composants à responsabilité unique. Chacun communique via des **ports** — jamais via des détails d'implémentation.

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERFACE                                │
│              (UI épurée — l'IA y est invisible)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    ORCHESTRATEUR DU CYCLE                        │
│   Enchaîne les étapes 5→9 pour chaque notion de la roadmap      │
│   Consomme et enrichit le contexte d'apprentissage              │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────┘
       │          │          │          │          │
┌──────▼──┐ ┌─────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌──▼──────────┐
│Diagnostic│ │Planifi- │ │Généra- │ │Exerci- │ │  Profil &   │
│          │ │ cation  │ │ teur   │ │ ciation│ │  Roadmap    │
│          │ │         │ │contenu │ │        │ │  (état)     │
└──────┬──┘ └────┬────┘ └───┬────┘ └───┬────┘ └──┬──────────┘
       │         │          │          │          │
       └─────────┴──────────┴──────────┴──────────┘
                             │
                    via PORTS (contrats)
                             │
       ┌─────────────────────┴─────────────────────┐
       │                                             │
┌──────▼──────────┐                       ┌──────────▼────────┐
│  ADAPTATEURS IA  │                       │ ADAPTATEURS INFRA │
│  (GPT, Claude,   │                       │ (Bible, BDD,      │
│   Gemini, mocks) │                       │  fichiers, HTTP)  │
└─────────────────┘                       └───────────────────┘
```

### Composants du cœur

| Composant | Responsabilité |
|---|---|
| **Modèle du domaine** | Entités métier : Domaine, Objectif, Profil, Roadmap, Notion, Cycle, Exercice… |
| **Orchestrateur du Cycle** | Pilote la séquence problématique → cours → expert → exercices → récompense |
| **Gestionnaire de profil** | Maintient et enrichit l'état vivant de l'apprenant |
| **Gestionnaire de roadmap** | Crée, versionne et adapte la feuille de route |
| **Contexte d'apprentissage** | Agrège les informations accumulées pour la génération just-in-time |

### Ports (interfaces vers l'extérieur)

| Port | Consommé par | Implémenté par |
|---|---|---|
| Capacités IA (§10) | Orchestrateur, gestionnaires | Adaptateurs IA |
| `KnowledgeSource` | Générateur de contenu, planification | Bible ou fallback |
| `Persistence` | Gestionnaires de profil et roadmap | BDD, fichiers… |

Le cœur **ne connaît ni l'IA, ni la base de données, ni le web**.

---

## 12. Principes d'architecture

Nous suivons une **architecture hexagonale (ports & adaptateurs)**, appliquée avec sobriété.

Principes :

- **Simplicité** — Pas d'abstraction spéculative. Une abstraction n'existe que pour répondre à un **besoin réel et présent**.
- **Séparation des responsabilités** — Le cœur ne dépend de rien d'externe. Les détails (IA, BDD, web) dépendent du cœur, jamais l'inverse (inversion de dépendances).
- **Modularité** — Chaque module a **une** responsabilité clairement définie.
- **Évolutivité** — On doit pouvoir ajouter **sans modifier le cœur** :
  - de nouveaux domaines,
  - de nouveaux médias/formats de contenu,
  - de nouvelles stratégies pédagogiques,
  - de nouveaux modèles d'IA,
  - de nouveaux moteurs de génération.
- **Testabilité** — Le cœur est testable **sans IA ni réseau**, grâce à des adaptateurs factices (mocks). La suite de tests ne doit jamais dépendre d'un appel réseau à un fournisseur.
- **Anti-over-engineering** — Le YAGNI est une règle, pas un slogan. On préfère le code simple qu'on comprend en 30 secondes.

### Structure de dossiers cible (indicative)

> Cette structure se met en place **progressivement**, module par module, selon les besoins réels. Elle n'est pas à créer d'un bloc.

```
src/
  core/
    domain/       # Entités métier (Domaine, Objectif, Profil, Roadmap, Notion…)
    ports/        # Interfaces des capacités + KnowledgeSource + Persistence
    cycle/        # Orchestration du parcours (le Cycle)

  adapters/
    ai/           # Implémentations des capacités par modèle (openai, anthropic, mock…)
    knowledge/    # Bible + fallback sans Bible
    persistence/  # Stockage de l'état d'apprentissage

  app/            # Interface utilisateur (épurée) + point d'entrée
```

---

## 13. Modèle du domaine (vocabulaire commun)

Termes de référence — à utiliser tels quels dans le code et les discussions :

| Terme | Définition |
|---|---|
| **Domaine** | Le champ de connaissance (maths, japonais…). |
| **Objectif** | Le but concret de l'élève. Contexte principal de la progression. |
| **Diagnostic** | Représentation du niveau réel de l'élève à un instant donné. |
| **Profil d'apprenant** | État vivant de l'élève : acquis, lacunes, erreurs fréquentes, préférences. Enrichi en continu. |
| **Roadmap** | Découpage évolutif de l'objectif en notions ordonnées. |
| **Notion** | Unité d'apprentissage. Possède prérequis, objectifs pédagogiques et **critères de maîtrise**. |
| **Cycle** | La séquence complète d'acquisition d'une notion (étapes 7.5→7.9). |
| **Contexte d'apprentissage** | Informations accumulées et réutilisées par les étapes (génération just-in-time). |
| **Problématique** | Tension cognitive créée avant le cours pour susciter la curiosité. |
| **Cours** | Contenu pédagogique principal, épuré et multi-format. |
| **Exemple d'expert** | Démonstration de la notion en contexte réel. |
| **Exercice** | Activité adaptative avec niveau de guidage variable. |
| **Correction** | Analyse personnalisée d'une réponse, avec explication ciblée. |
| **Remédiation** | Nouvel exercice ciblant précisément une difficulté identifiée. |
| **Capacité** | Contrat métier implémentable par de l'IA (voir §10). |
| **Bible** | Source de connaissances validée par des experts (voir §8). |

---

## 14. Objectifs de maintenabilité

- Un nouveau développeur doit **comprendre l'ambition du projet en lisant ce README seul**.
- Chaque module reste **petit, focalisé, nommé d'après le métier** (jamais d'après une techno).
- Le cœur **ne mentionne jamais** un nom de fournisseur d'IA.
- Les frontières (ports) sont **explicites** et documentées par leur type/interface.
- Toute complexité ajoutée doit être **justifiée** par un besoin réel et présent.

---

## 15. Principes d'évolutivité

- **Ajouter, ne pas modifier** : les extensions (domaines, formats, stratégies, modèles) passent par de **nouveaux adaptateurs**, pas par des modifications du cœur.
- **Découverte tardive** : on n'anticipe pas les besoins futurs par de la complexité. On refactore quand le besoin réel apparaît.
- **Remplaçabilité** : tout adaptateur (IA, Bible, stockage) doit pouvoir être remplacé sans effet de bord au-delà de sa frontière.

---

## 16. Conventions générales

- **Langue** — Documentation produit et vocabulaire métier en **français** (aligné sur le domaine et l'équipe). Le code (identifiants, types) suit le vocabulaire du domaine défini au §13.
- **Nommage** — Les noms reflètent le **métier**, jamais la technologie. Interdit : `GPTService`, `OpenAIController`. Autorisé : `Diagnostic`, `GénérateurDeCours`, `SourceDeConnaissances`.
- **Dépendances** — Le sens des dépendances va toujours **vers le cœur**. Le cœur n'importe jamais un adaptateur.
- **Tests** — Le cœur est couvert par des tests exécutables **hors ligne** (adaptateurs mock). Aucun test unitaire ne fait d'appel réseau réel.
- **IA** — Tout appel à un modèle passe par un **port de capacité**. Aucun appel direct à un SDK de fournisseur en dehors de son adaptateur dédié.
- **Commits** — Chaque commit doit laisser le projet dans un état cohérent avec cette Constitution.

---

## 17. La règle d'or

Avant chaque décision, poser deux questions :

1. **« Est-ce que cela améliore réellement l'apprentissage de l'élève ? »**
2. **« Est-ce que cela garde le cœur simple et indépendant des modèles d'IA ? »**

Si l'une des deux réponses est « non », il faut reconsidérer la décision.

---

## 18. État du projet

🟡 **Phase 0 — Fondations.**

| Livrable | Statut |
|---|---|
| Constitution (ce README) | ✅ |
| Modèle du domaine (`src/core/domain/`) | ✅ |
| Ports (`src/core/ports/`) | ✅ |
| Adaptateurs mock (`src/adapters/`) | ✅ — mock IA (configurable), fallback Bible, mémoire |
| Adaptateurs IA réels (`src/adapters/ai/`) | ✅ — Anthropic, OpenAI, Google via Vercel AI SDK + sélecteur UI |
| Orchestrateur du Cycle (`src/core/cycle/`) | ✅ — étapes 5→9, boucle remédiation, persistance |
| ParcoursApprentissage (`src/core/parcours/`) | ✅ — diagnostic + planification, testé hors ligne |
| Interface utilisateur (`src/app/`) | ✅ — App Router + Tailwind, Server Actions, IA en arrière-plan |

Le `ParcoursApprentissage` produit un `ContexteApprentissage` prêt (profil + roadmap) consommable par l'`OrchestrateurCycle`. La reprise d'un objectif existant reste hors scope pour l'instant.

### Configuration des adaptateurs IA

L'application propose un sélecteur fournisseur/modèle sur l'écran d'accueil. Le mode **Mock** fonctionne hors ligne sans clé API.

Pour utiliser un fournisseur réel :

1. Copier `.env.local.example` en `.env.local`
2. Renseigner la clé du fournisseur choisi :
   - `ANTHROPIC_API_KEY` — Anthropic
   - `OPENAI_API_KEY` — OpenAI
   - `GOOGLE_GENERATIVE_AI_API_KEY` — Google
3. Redémarrer le serveur de développement (`npm run dev`)

Si une clé est manquante, l'application affiche une erreur explicite au premier appel IA.

Le code sera construit **progressivement**, module par module, en cohérence stricte avec ce document. Chaque module n'est créé que lorsque le besoin réel le justifie.
