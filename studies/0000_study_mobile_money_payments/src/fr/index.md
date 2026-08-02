---
title: Le paiement est le produit
toc: false
---

```js
import {fmtInt, fmtPct, duplicates, settlementCurve, timeToSettle} from "../components/settlement.js";
const surfaces = await FileAttachment("../data/surfaces.csv").csv({typed: true});
const codes = await FileAttachment("../data/response_classes.csv").csv({typed: true});
const cover = FileAttachment("../cover.svg");
```

<div class="hero">
  <h1>Le paiement<br>est le produit</h1>
  <h2>Partie 1 sur 3. Construire un processeur de paiement pour un marché où les cartes sont l'exception, pas la règle.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Spiritueux de luxe, vente directe</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Afrique centrale (RDC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Boutique · Back-office · Appli coursier · API Admin</span></div>
  <div class="field"><span class="k">Cette partie</span><span class="v">Le processeur Mobile Money</span></div>
</div>

Voici l'histoire de ce qui se passe quand on construit du e-commerce pour un marché où **90% des clients n'ont pas de carte bancaire.**

Nous avons lu le code. Nous avons tracé les transactions. Nous avons vérifié chaque affirmation contre l'implémentation réelle dans `shared/libs/go/payments/mpesa_drc/` et `bijougabriel-api/application/usecases/payment/mpesa/`. Pas de slides marketing. Pas de vague de la main. Juste de l'ingénierie.

## La contrainte qui a tout redéfini

La plupart des plateformes e-commerce traitent le paiement comme une formalité — une intégration Stripe ajoutée à un tunnel de paiement conçu pour les détenteurs de cartes. Ça fonctionne quand vos clients ont des cartes.

En République Démocratique du Congo, ce n'est pas le cas.

Ici, **le Mobile Money est l'infrastructure.** M-Pesa, Orange Money, Airtel Money — ce sont les moyens de paiement. L'identifiant de compte est un numéro de téléphone. La confirmation se fait sur le terminal. Le règlement est asynchrone par conception. Un formulaire de carte n'est pas une option sous-optimale ; pour la majorité du marché adressable, **ce n'est tout simplement pas une option.**

Nous n'avons donc pas intégré un processeur de paiement. Nous en avons **construit un.** De zéro. Pour l'API OpenAPI de M-Pesa RDC. Et il est devenu la partie la plus critique et la plus complexe de toute la plateforme.

### Ce que le tunnel propose réellement

Chaque ligne ci-dessous provient directement de l'énumération des moyens de paiement dans le composant de paiement de la boutique et du câblage de service correspondant côté API Go. La colonne `ui_flag` est l'interrupteur visible par l'utilisateur — une décision produit qui évolue indépendamment de l'existence du chemin serveur.

```js
Inputs.table(surfaces, {
  columns: ["method", "ui_flag", "backend", "settlement", "notes_fr"],
  header: {
    method: "Moyen",
    ui_flag: "Visible au checkout",
    backend: "Chemin serveur",
    settlement: "Règlement",
    notes_fr: "Note"
  },
  width: {notes_fr: 300},
  rows: 8
})
```

**Lecture honnête :** Le Mobile Money est complet et câblé côté serveur, mais derrière un interrupteur dans l'interface. Construire un moyen de paiement et le déployer sont deux événements distincts. Cette étude traite du premier — l'ingénierie qui rend le second possible.

## Pourquoi nous n'avons pas pu simplement installer un SDK

La surface OpenAPI de M-Pesa ne fonctionne pas comme les API de paiement modernes. Nous l'avons découvert à la dure, puis nous avons construit autour.

Chaque comportement ci-dessous est lu dans notre bibliothèque cliente interne (≈ 1 300 lignes de Go dans un package partagé `payments/`) et dans le fichier de constantes qui fige les endpoints et les codes de réponse du rail.

- **Les identifiants sont chiffrés, pas signés.** La clé d'API est chiffrée en RSA (PKCS#1 v1.5) contre une clé publique spécifique au marché, embarquée dans le binaire en DER base64. Nous en embarquons deux : une pour le bac à sable, une pour la production.

- **L'authentification est une session, et la session expire.** Un appel à `getSession` renvoie une clé de session (elle-même chiffrée en RSA) utilisée comme jeton porteur. Elle vit environ une heure. Puis elle meurt.

- **La confirmation n'arrive pas dans la réponse.** L'API vous dit que l'instruction a été acceptée. Savoir si l'acheteur l'a validée sur son terminal arrive plus tard, via un callback, indexé par un identifiant de corrélation que vous avez généré.

- **Les erreurs sont un vocabulaire métier, pas du HTTP.** `INS-0` signifie succès. Tout le reste est un code que vous devez classer vous-même, car la couche transport renverra volontiers un 200 contenant un refus.

Ce dernier point est là où la plupart des intégrations échouent. Un client de paiement qui traite "l'appel HTTP a réussi" comme "le paiement a réussi" semble correct en pré-production et **perd de l'argent en production.**

```js
Inputs.table(codes, {
  columns: ["code", "class", "retryable", "operator_action"],
  header: {
    code: "Code",
    class: "Classe",
    retryable: "Rejouable",
    operator_action: "Ce que fait le processeur"
  },
  rows: 10
})
```

### Le gestionnaire de session : où la fiabilité commence

La session est une ressource partagée, mutable et périssable placée devant chaque appel de paiement. Se tromper ici, et tout échoue.

Notre implémentation conserve une session pendant 55 minutes face à une durée de vie côté rail d'environ une heure. Nous rafraîchissons **cinq minutes en avance** plutôt que d'attendre qu'on nous apprenne que la session est morte. Le rafraîchissement utilise un backoff exponentiel (1s initial, facteur 2, plafond 30s, 3 tentatives) et ne réessaye que sur les classes transitoires : 5xx, délais dépassés, erreurs de connexion.

La concurrence est gérée par un mutex lecteur/écrivain avec double vérification après prise du verrou d'écriture. Une rafale de requêtes arrivant à expiration produit **un seul rafraîchissement, pas un par requête.**

La marge de cinq minutes est délibérée. Rafraîchir à expiration signifie que la première requête après l'heure paie la latence du rafraîchissement *et* entre en compétition avec toutes les autres requêtes arrivées dans la même milliseconde. Rafraîchir en avance transforme un blocage visible par l'utilisateur en appel d'arrière-plan.

## Idempotence : quand l'acheteur appuie une deuxième fois

Voici la séquence qui coûte de l'argent.

L'acheteur valide. Le terminal ne vibre pas dans les secondes qui suivent — le rail est lent, la notification est en file, ou l'acheteur ne croit tout simplement pas qu'il se soit passé quelque chose. Il appuie à nouveau.

Notre processeur reçoit un `idempotency_id` de l'appelant et cherche un paiement existant sous cette clé **avant** que quoi que ce soit n'atteigne le rail. Une correspondance renvoie un conflit qui résout vers le paiement d'origine au lieu d'en démarrer un second.

Séparément, chaque tentative génère un identifiant de corrélation ULID porté par l'instruction et utilisé pour rattacher le callback à la ligne. Charges utiles de requête, latences et codes de réponse sont journalisés dans leurs propres tables. Tout comme les corps bruts des webhooks.

```js
const attempts = view(Inputs.range([100, 20000], {value: 2500, step: 50, label: "Tentatives de paiement / jour"}));
const retryRate = view(Inputs.range([0, 0.6], {value: 0.18, step: 0.01, label: "Acheteurs qui re-valident", format: (x) => fmtPct(x, 0)}));
const extraTaps = view(Inputs.range([1, 4], {value: 1.6, step: 0.1, label: "Validations supplémentaires chacun"}));
const doubleDebitOdds = view(Inputs.range([0, 1], {value: 0.35, step: 0.01, label: "Doublon non protégé qui débite vraiment", format: (x) => fmtPct(x, 0)}));

const dup = duplicates({attempts, retryRate, extraTaps, doubleDebitOdds});
```

```js
<div class="grid grid-cols-3">
  <div class="card"><h2>Re-validations / jour</h2><span class="big">${fmtInt(dup.resubmissions)}</span><span class="muted">absorbées par la clé d'idempotence</span></div>
  <div class="card"><h2>Appels au rail évités</h2><span class="big">${fmtInt(dup.unguardedRailCalls - dup.guardedRailCalls)}</span><span class="muted">par jour, vs. sans clé</span></div>
  <div class="card"><h2>Doubles débits évités</h2><span class="big" style="color:#2f8f5b">${fmtInt(dup.unguardedDoubleDebits)}</span><span class="muted">par jour, vs. sans clé</span></div>
</div>
```

Chacun de ces débits évités est une conversation avec le support, un remboursement, et un acheteur qui ne reviendra pas. Le chemin de reversement existe — il écrit un paiement de type `reversal` et marque l'original comme reversé, si bien que le remboursement est une ligne et non un souvenir. Mais le remboursement le moins cher est celui qu'il n'a jamais fallu émettre.

## Le règlement est asynchrone, donc la réconciliation n'est pas optionnelle

Notre processeur fonctionne selon deux modes, choisis au démarrage selon l'environnement :

- **Développement** : Règlement en synchrone. Une instruction acceptée passe directement à `completed`, car un callback ne peut pas atteindre un poste de travail.
- **Production** : Règlement en asynchrone. Une instruction acceptée passe à `processing`. Seul le callback la fait passer à `completed` ou `failed`.

Le rail expose aussi une requête d'état, qui transforme un callback perdu en callback récupérable.

<svg class="schematic" viewBox="0 0 1000 300" role="img" aria-label="Chemin de règlement asynchrone">
  <defs>
    <marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="10" y="40" width="150" height="46" rx="7"/>
      <rect x="10" y="200" width="150" height="46" rx="7"/>
      <rect x="420" y="40" width="170" height="46" rx="7"/>
      <rect x="420" y="200" width="170" height="46" rx="7"/>
      <rect x="830" y="120" width="160" height="46" rx="7"/>
    </g>
    <text x="85" y="68" text-anchor="middle">acheteur</text>
    <text x="85" y="228" text-anchor="middle">combiné</text>
    <text x="505" y="68" text-anchor="middle">service paiement</text>
    <text x="505" y="228" text-anchor="middle">tables de journal</text>
    <text x="910" y="148" text-anchor="middle">rail mobile money</text>

    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#a1)">
      <path d="M160 63 H415"/>
      <path d="M590 55 C 700 55, 740 120, 826 134"/>
      <path d="M505 90 V 196"/>
      <path d="M160 223 C 300 223, 700 223, 826 158"/>
    </g>
    <path d="M826 152 C 700 168, 640 96, 592 80" fill="none" stroke="currentColor"
          stroke-width="1.6" stroke-dasharray="6 5" marker-end="url(#a1)" opacity="0.7"/>

    <g font-size="12" opacity="0.75">
      <text x="288" y="52" text-anchor="middle">valider + idempotency_id</text>
      <text x="712" y="76" text-anchor="middle">instruction C2B</text>
      <text x="520" y="150">journal : requête, latence, code</text>
      <text x="470" y="248" text-anchor="middle">approbation sur le combiné</text>
      <text x="700" y="128" text-anchor="middle">callback · id de corrélation</text>
    </g>
  </g>
</svg>
<p class="schematic-caption">L'arête en pointillés est celle qui peut se perdre. Tout ce qui est en aval, c'est de la réconciliation.</p>

Le callback en pointillés est une livraison, et les livraisons échouent. La question à laquelle une plateforme doit répondre n'est pas « le webhook fonctionne-t-il » mais **« combien de temps un paiement reste-t-il en `processing` quand il ne fonctionne pas ? »**

L'identifiant de corrélation doit être généré et stocké avant l'envoi de l'instruction, jamais dérivé de la réponse du rail. Un paiement que vous ne savez pas nommer est un paiement que vous ne savez pas réconcilier.

## Ce que cela achète, en clair

- **Un acheteur sans carte peut finaliser son achat** — ce qui représente le marché adressable entier plutôt qu'une tranche.

- **Un acheteur qui valide deux fois est débité une fois** — par construction et non par vigilance.

- **Un callback qui n'arrive jamais devient un délai au lieu d'une perte** — car le grand livre est réconcilié avec le rail plutôt que déduit de lui.

- **Chaque instruction, latence, code de réponse et corps de callback brut est sur disque** — un paiement contesté se règle par une requête, pas par une supposition.

Rien d'exotique là-dedans. C'est la discipline ordinaire d'un système de paiement, appliquée à un rail qui ne la livrait pas dans la boîte.

## Le back-office : où les opérateurs contrôlent l'argent

Derrière les coulisses, le `bijougabriel-admin` offre à l'entreprise une visibilité et un contrôle complets sur les paiements :

- **Surveillance en temps réel** des états de paiement, avec filtres pour les transactions en attente, en cours, terminées et échouées
- **Outils de réconciliation manuelle** pour faire correspondre les paiements aux commandes lorsque les callbacks échouent
- **Initiation de reversement** pour les remboursements, avec des traces d'audit complètes reliant les reversements aux paiements originaux
- **Journaux des webhooks** montrant chaque callback reçu, avec charges utiles brutes et temps de réponse
- **Rapports de règlement** suivant quels paiements ont été confirmés par le rail Mobile Money

Le composant `CatalogManagement.tsx` de l'admin fournit le flux de travail de publication de type Git pour le catalogue, tandis que les tableaux de bord de paiement appliquent la même discipline au mouvement d'argent : chaque changement d'état est journalisé, chaque action est auditable, et chaque divergence a une trace écrite.

## La suite

Le processeur donne à la plateforme des mouvements d'argent corrects. Il ne fait rien pour l'autre moitié du problème : servir un catalogue rapidement, de loin, à des appareils sur des données mobiles coûteuses.

[**Partie 2 — Le catalogue est un artefact de build**](https://computeflux.xyz/studies/edge-serving-layer) traite de la couche de desserte : un pipeline d'images du stockage objet vers un bucket CDN en passant par libvips, et un catalogue *publié* vers l'edge sous forme d'instantané versionné et adressé par hash de contenu, plutôt que synchronisé ligne à ligne.

---

<div class="small muted">Les chiffres signalés comme modélisés sont produits par les curseurs ci-dessus et décrivent la forme d'un problème, pas le trafic de cet opérateur. Les comportements signalés comme lus dans le code ont été vérifiés à la source. Le client, la plateforme et ses domaines sont volontairement tus.</div>

<style>
:root { --cb-verified: "Lu dans le code livré"; --cb-modelled: "Un modèle, pas une mesure"; --cb-proposed: "Proposé, pas déployé"; }
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.02; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 42rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 2rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
</style>
