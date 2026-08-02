---
title: Le catalogue est un artefact de build
toc: false
---

```js
import {fmtInt, fmtPct, fmtDuration, writeAmplification, mediaQueue} from "../components/serving.js";
const variants = await FileAttachment("../data/variants.csv").csv({typed: true});
const kvKeys = await FileAttachment("../data/kv_keys.csv").csv({typed: true});
const cover = FileAttachment("../cover.svg");
```

<div class="hero">
  <h1>Le catalogue est<br>un artefact de build</h1>
  <h2>Partie 2 sur 3. Échanger vingt-huit triggers de base de données contre un bouton « publier » — et le back-office qui le rend possible.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Spiritueux de luxe, vente directe</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Afrique centrale (RDC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Boutique · Back-office · Appli coursier · API</span></div>
  <div class="field"><span class="k">Cette partie</span><span class="v">La couche de desserte et le contrôle opérateur</span></div>
</div>

La [partie 1](https://computeflux.xyz/studies/mobile-money-payment-processor) traitait du processeur de paiement — la raison pour laquelle cette plateforme peut accepter de l'argent sur un marché où les formulaires de carte ne fonctionnent pas. Cette partie traite de l'autre moitié de l'histoire : **mettre un catalogue de photographies de produits lourdes devant un acheteur sur données mobiles, à des milliers de kilomètres de la base de données.** Et donner à l'entreprise un contrôle complet sur le quand et le comment.

## Une règle qui a tout changé

**Le rendu d'une page n'interroge jamais la base relationnelle.**

Ça ressemble à une décision de cache. Ce n'en est pas une. C'est une **décision de propriété**, et elle scinde le système en trois zones qui ne partagent jamais une responsabilité :

<svg class="schematic" viewBox="0 0 1000 250" role="img" aria-label="Trois zones : rédaction, média, publié">
  <defs>
    <marker id="z1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="10" y="60" width="250" height="120" rx="10"/>
      <rect x="375" y="60" width="250" height="120" rx="10"/>
      <rect x="740" y="60" width="250" height="120" rx="10"/>
    </g>
    <g font-size="11" letter-spacing="2" opacity="0.7">
      <text x="20" y="46">RÉDACTION</text>
      <text x="385" y="46">MÉDIA</text>
      <text x="750" y="46">PUBLIÉ</text>
    </g>
    <g text-anchor="middle">
      <text x="135" y="105">base relationnelle</text>
      <text x="135" y="128" opacity="0.7">brouillon · actif · archivé</text>
      <text x="135" y="158" opacity="0.7">seule vérité modifiable</text>
      <text x="500" y="105">stockage objet → resize → CDN</text>
      <text x="500" y="128" opacity="0.7">clés immuables, versionnées</text>
      <text x="500" y="158" opacity="0.7">indépendant de la publication</text>
      <text x="865" y="105">clé-valeur edge</text>
      <text x="865" y="128" opacity="0.7">instantané en lecture seule</text>
      <text x="865" y="158" opacity="0.7">reconstructible de zéro</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#z1)">
      <path d="M260 120 H370"/>
      <path d="M625 120 H735"/>
    </g>
    <g font-size="11" opacity="0.75" text-anchor="middle">
      <text x="315" y="110">upload</text>
      <text x="680" y="110">publier</text>
    </g>
  </g>
</svg>
<p class="schematic-caption">La zone publiée ne contient rien qui ne puisse être régénéré. C'est ce qui rend sûr de la jeter.</p>

L'instantané edge n'est pas un cache qui pourrait être périmé : c'est une **sortie de build**, au même titre qu'un binaire compilé. Il porte une version, il est produit par une action explicite, et il peut être reconstruit depuis la source de vérité à tout moment.

Cette architecture existe à cause d'une vérité simple : **sur les marchés émergents, chaque octet compte.** Les données mobiles sont chères. La latence tue les conversions. Et une requête de base de données de Kinshasa vers Francfort est les deux à la fois.

## Le pipeline média : de la photographie fournisseur au CDN mondial

Les originaux atterrissent dans un bucket compatible S3 (Hetzner en production, MinIO en dev), plafonnés à 50 Mo, en JPEG, PNG, WebP, GIF et AVIF. Un déclencheur de base de données met un job en file. Un pool de workers le réclame, télécharge l'original, le redimensionne avec libvips via les liaisons Go (`govips`), puis téléverse chaque variante dans le bucket CDN (Cloudflare R2) avec `Cache-Control: public, max-age=31536000, immutable`.

Deux détails rendent ce pipeline de niveau production :

**Clés versionnées et cache immuable.** Une variante n'est jamais écrasée. Un nouveau rendu reçoit un nouveau préfixe de version (`v42/products/...`), donc il n'y a pas d'invalidation de cache à orchestrer côté CDN et pas de fenêtre pendant laquelle deux utilisateurs voient des images différentes sous la même URL. Le coût, c'est du stockage — c'est-à-dire la chose la moins chère du système.

**L'aller-retour de sanitisation.** La photographie fournisseur réelle contient des fichiers malformés sur lesquels libvips échouera. Décoder en PNG puis ré-encoder avant redimensionnement convertit une classe d'échecs durs en succès plus lents. C'est le genre de décision qui n'existe que dans un code ayant rencontré de vraies entrées — celles qui viennent de vrais fournisseurs à Kinshasa, pas de photos stock d'Unsplash.

### Réclamer du travail sans convoi de verrous

Les jobs vivent dans une table Postgres. Les workers les réclament par une instruction atomique unique — `SELECT ... WHERE status='pending' ORDER BY priority DESC, scheduled_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED` — ce qui permet à un nombre quelconque de workers de tirer en parallèle sans se bloquer.

Les échecs sont rejoués en backoff exponentiel (plafonné à trois tentatives). Les jobs détenus par un worker planté repassent en attente via un balayage des verrous périmés.

Aucun broker de file n'a été introduit. La base était déjà là, déjà transactionnelle, déjà sauvegardée. `SKIP LOCKED` est exactement la primitive dont une file de travail a besoin. Un système de moins à exploiter, superviser et restaurer à 3h du matin.

### L'échelle de variantes : développement vs production

Deux familles de variantes existent, une par environnement, et elles ne correspondent pas. Le développement produit cinq largeurs ; la production en produit quatre, nommées d'après des appareils plutôt que des tailles.

```js
Inputs.table(variants, {
  columns: ["environment", "variant", "edge_px", "purpose_fr"],
  header: {environment: "Environnement", variant: "Variante", edge_px: "Grand côté (px)", purpose_fr: "Usage"},
  rows: 10
})
```

Cette divergence est un constat réel. Une variante qui existe en développement et pas en production est une URL qui résout en local et renvoie 404 en ligne. C'est peu coûteux à corriger — une liste de configuration, promue — et exactement le genre de chose qu'une revue de code fait apparaître et qu'une démonstration cache.

## La publication : où les opérateurs prennent le contrôle

La première version de cette plateforme synchronisait l'edge de la manière évidente : des déclencheurs de base de données se déclenchaient à chaque changement de ligne et mettaient en file une tâche de synchronisation par clé affectée.

Ce mécanisme représentait **28 déclencheurs et 18 fonctions.** Il a été supprimé par une migration unique dont le nom dit ce qu'elle a fait : `remove_kv_sync_triggers_add_catalog_publishes`. Les écritures edge ne sont désormais produites que par une action de publication explicite, groupées par des écritures multi-clés, et réconciliées contre un hash de contenu stocké par entité.

Pourquoi ? Parce que le déclencheur par ligne échoue pour une raison qui n'a rien à voir avec la correction et tout à voir avec le fan-out. Une modification de produit n'est pas une écriture edge. La clé du produit change, mais aussi chaque collection et chaque index auxquels il appartient : l'ensemble des produits, l'index de sa catégorie, l'index de son producteur, l'index de recherche. Un rédacteur qui corrige cinq fautes dans un après-midi génère des écritures proportionnelles à la *forme du catalogue*, pas à la taille de la modification.

### Publier se comporte comme un commit

L'application `bijougabriel-admin` transforme la publication en un flux de travail de type Git que les opérateurs comprennent déjà :

<div class="verified">La prévisualisation calcule le hash de contenu de chaque entité active, le compare au hash stocké et renvoie un diff — ajoutés, modifiés, supprimés, plus des avertissements. La publication enregistre une ligne dans une table de publications, construit toutes les structures edge, les écrit par lots, met à jour les hashes stockés, écrit le marqueur de version et archive le résultat avec ses décomptes, sa durée et une note en texte libre. L'historique liste chaque publication passée avec sa version, son diff et son auteur.</div>

<svg class="schematic" viewBox="0 0 1000 220" role="img" aria-label="Prévisualiser, publier, historique">
  <defs>
    <marker id="p1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="ui-monospace, Menlo, monospace" font-size="13" fill="currentColor">
    <g fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.55">
      <rect x="20" y="70" width="200" height="80" rx="9"/>
      <rect x="400" y="70" width="200" height="80" rx="9"/>
      <rect x="780" y="70" width="200" height="80" rx="9"/>
    </g>
    <g text-anchor="middle">
      <text x="120" y="104">prévisualiser</text>
      <text x="120" y="128" opacity="0.7" font-size="11">diff de hash, zéro écriture</text>
      <text x="500" y="104">publier</text>
      <text x="500" y="128" opacity="0.7" font-size="11">par lots, versionné</text>
      <text x="880" y="104">historique</text>
      <text x="880" y="128" opacity="0.7" font-size="11">version · diff · auteur</text>
    </g>
    <g stroke="currentColor" stroke-width="1.6" fill="none" marker-end="url(#p1)">
      <path d="M220 110 H395"/>
      <path d="M600 110 H775"/>
    </g>
    <path d="M880 70 C 880 20, 120 20, 120 66" fill="none" stroke="currentColor"
          stroke-width="1.4" stroke-dasharray="6 5" marker-end="url(#p1)" opacity="0.7"/>
    <text x="500" y="34" text-anchor="middle" font-size="11" opacity="0.7">une version publiée est une chose que l'on peut désigner</text>
  </g>
</svg>

Le vocabulaire est délibéré. Un opérateur qui a utilisé un gestionnaire de versions sait ce que prévisualiser, publier et historique veulent dire. Le diff rend le rayon d'action d'un changement visible *avant* qu'il n'atteigne un acheteur.

À comparer avec un déclencheur, où le changement est déjà en ligne au moment où quelqu'un aurait pu le regarder.

### Ce que contient l'instantané

La carte des clés ci-dessous est lue dans le publieur et dans le lecteur edge. Un changement de slug laisse une pierre tombale dans l'index des slugs, qui résout vers une redirection : une ancienne URL produit partagée sur une messagerie ne devient pas un 404.

```js
Inputs.table(kvKeys, {
  columns: ["key", "shape", "read_by", "role_fr"],
  header: {key: "Clé", shape: "Forme", read_by: "Lue par", role_fr: "Rôle"},
  width: {key: 300, role_fr: 280},
  rows: 12
})
```

À la lecture, le worker edge charge ces clés en parallèle et dénormalise les références — producteur, régions, notes de dégustation, récompenses — en objets imbriqués, avec un repli par préfixe de nom pour les enregistrements dont les identifiants ont dérivé.

**La boutique ne fait jamais de jointure.** La jointure a déjà eu lieu au moment de la publication.

## Le back-office : le contrôle opérateur sur la couche de desserte

L'application `bijougabriel-admin`, construite avec React, Vite et Ant Design, est là où l'entreprise contrôle toute la couche de desserte. Elle fournit :

- **Gestion du catalogue** (`CatalogManagement.tsx`) : Le flux de travail de publication de type Git avec prévisualisation, diff et historique. Les opérateurs voient exactement ce qui va changer avant que ce ne soit en ligne.
- **Tableau de bord média** : Vue en temps réel des jobs de traitement d'images, avec capacités de nouvelle tentative et d'annulation. Suivi des originaux en cours de traitement, des variantes générées et des échecs.
- **État de synchronisation** : Surveillance des jobs en arrière-plan qui alimentent le pipeline média et la publication du catalogue. Le `syncJobStorage` et le pool de workers sont entièrement observables.
- **Inspecteur KV** : Accès en lecture directe au catalogue publié dans Cloudflare KV. Vérification que la dernière publication est bien arrivée à l'edge.
- **Historique des versions** : Trace d'audit complète de chaque publication, avec horodatages, auteur, notes de commit et statistiques sur ce qui a changé.

Ce n'est pas simplement une interface CRUD. C'est un **plan de contrôle** pour la couche de desserte, conçu pour les opérateurs qui doivent comprendre et gérer un système desservant des clients à travers l'Afrique centrale.

## Ce que cela achète, en clair

- **Une fiche produit est une lecture de clé** sur un point de présence proche de l'acheteur, pas un aller-retour vers une base sur un autre continent. Sur des marchés où les données mobiles coûtent cher, ce n'est pas un plus — c'est essentiel.

- **Les rédacteurs voient l'ensemble exact des changements** qu'une publication va produire avant qu'elle ne les produise, et peuvent désigner la version qui a introduit une régression. Plus de "mais ça marchait en staging" — car staging et production utilisent le même mécanisme de publication.

- **Le volume d'écritures edge est découplé de l'activité éditoriale** : un import de masse ne se traduit pas en facture ni en limitation de débit. L'entreprise peut faire 100 changements dans une journée sans s'inquiéter des coûts Cloudflare.

- **La zone publiée entière peut être supprimée et reconstruite** depuis la source relationnelle, ce qui fait de la reprise une procédure et non un incident. Si quelque chose ne va pas, vous pouvez toujours republier depuis zéro.

## La suite

Exploiter sa propre boutique à l'edge a une conséquence que cette plateforme a pleinement embrassée. Chaque requête traverse déjà un serveur que l'opérateur contrôle, sur son propre domaine, porteur de son propre cookie first-party — et ce serveur sait déjà quel instantané de catalogue il a servi.

[**Partie 3 — Signal first-party, sans tracker**](https://computeflux.xyz/studies/first-party-signal-dco-newsletter) transforme ce flux de requêtes en cohortes k-anonymes calculées côté serveur, et ces cohortes en une newsletter qui s'assemble par destinataire à partir du même catalogue publié que lit la boutique.

---

<div class="small muted">Les chiffres signalés comme modélisés sont produits par les curseurs ci-dessus et décrivent la forme d'un problème, pas le trafic de cet opérateur. Les comportements signalés comme lus dans le code ont été vérifiés à la source. Le client, la plateforme et ses domaines sont volontairement tus.</div>

<style>
:root { --cb-verified: "Lu dans le code livré"; --cb-modelled: "Un modèle, pas une mesure"; --cb-proposed: "Proposé, pas déployé"; }
.hero { text-align: center; margin: 2rem 0 2rem; }
.hero h1 { font-size: clamp(2.2rem, 6.4vw, 4rem); line-height: 1.04; margin: 0; font-weight: 800; letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--theme-foreground), var(--theme-foreground-focus, #2f6bff)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero h2 { font-size: clamp(1rem, 2.4vw, 1.3rem); font-weight: 400; max-width: 44rem; margin: 1rem auto 0; color: var(--theme-foreground-muted); }
.card .big { display: block; font-size: 1.9rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.card .muted, .muted { color: var(--theme-foreground-muted); }
.card h2 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin: 0 0 0.35rem; color: var(--theme-foreground-muted); }
.small { font-size: 0.8rem; }
.tip { margin: 1.25rem 0; padding: 0.75rem 1rem; border-left: 3px solid var(--theme-foreground-focus, #2f6bff); background: var(--theme-background-alt, rgba(47,107,255,0.06)); border-radius: 0 6px 6px 0; font-size: 0.92rem; }
</style>
