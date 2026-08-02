---
title: "Edge e-commerce: le catalogue est un artefact de build"
toc: false
---

```js
import {fmtInt, fmtPct, fmtDuration, writeAmplification, mediaQueue} from "../components/serving.js";
const variants = await FileAttachment("../data/variants.csv").csv({typed: true});
const kvKeys = await FileAttachment("../data/kv_keys.csv").csv({typed: true});
const cover = FileAttachment("../cover.svg");
```

<div class="hero">
  <h1>Edge e-commerce: Le catalogue est<br>un artefact de build</h1>
  <h2>Partie 2 sur 3. Vingt-huit triggers de base de données échangés contre un seul bouton « publier » — et le back-office qui rend la chose possible.</h2>
</div>

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">Spiritueux de luxe, vente directe</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">Afrique centrale (RDC)</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">Boutique · Back-office · Appli coursier · API</span></div>
  <div class="field"><span class="k">Cette partie</span><span class="v">La couche de desserte et le contrôle opérateur</span></div>
</div>

La [partie 1](https://computeflux.xyz/studies/mobile-money-payment-processor) portait sur le processeur de paiement : c'est lui qui permet à la plateforme d'encaisser sur un marché où les formulaires de carte bancaire ne servent à rien. Cette partie couvre l'autre moitié du problème : **afficher un catalogue de photographies lourdes chez un acheteur en données mobiles, à des milliers de kilomètres de la base de données.** Et laisser à l'entreprise la maîtrise complète du moment et de la manière.

## Une règle qui a tout changé

**Le rendu d'une page n'interroge jamais la base relationnelle.**

On croirait une question de cache. Ce n'en est pas une. C'est une **question de propriété**, et elle découpe le système en trois zones qui ne se partagent jamais une responsabilité :

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
<p class="schematic-caption">La zone publiée ne contient rien qui ne puisse être régénéré. C'est ce qui permet de la jeter sans risque.</p>

L'instantané edge n'est pas un cache susceptible d'être périmé : c'est un **produit de build**, au même titre qu'un binaire compilé. Il porte une version. Il est produit par une action explicite. Il se reconstruit à tout moment depuis la source de vérité.

Cette architecture découle d'un constat simple : **sur les marchés émergents, chaque octet compte.** Les données mobiles coûtent cher. La latence fait chuter les conversions. Une requête de base de données entre Kinshasa et Francfort cumule les deux.

## Le pipeline média : de la photo fournisseur au CDN mondial

Les originaux arrivent dans un bucket compatible S3 (Hetzner en production, MinIO en développement), plafonnés à 50 Mo, en JPEG, PNG, WebP, GIF ou AVIF. Un trigger de base de données met un job en file. Un worker du pool s'attribue ce job, télécharge l'original, le redimensionne avec libvips via les bindings Go (`govips`), puis dépose chaque variante dans le bucket CDN (Cloudflare R2) avec `Cache-Control: public, max-age=31536000, immutable`.

Deux détails rendent ce pipeline solide en production :

**Clés versionnées, cache immuable.** Une variante n'est jamais écrasée : un nouveau rendu reçoit un nouveau préfixe de version (`v42/products/...`). Il n'y a donc aucune invalidation de cache à orchestrer côté CDN, et aucune fenêtre pendant laquelle deux visiteurs voient deux images différentes sous la même URL. Le prix à payer, c'est du stockage — la ressource la moins chère du système.

**Le détour par une passe d'assainissement.** Les photos que fournissent réellement les fournisseurs contiennent des fichiers malformés, sur lesquels libvips échoue. On les décode en PNG et on les ré-encode avant de redimensionner : toute une classe d'échecs bloquants devient une classe de succès un peu plus lents. Ce genre de décision ne se prend pas sur le papier. Elle vient d'un code qui a vu passer de vraies images, celles des fournisseurs de Kinshasa et non des banques d'images.

### Prendre un job sans *lock convoy*

Les jobs vivent dans une table Postgres. Un worker s'attribue le sien avec une seule instruction atomique — `SELECT ... WHERE status='pending' ORDER BY priority DESC, scheduled_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED` — ce qui laisse autant de workers que l'on veut consommer la file en parallèle, sans qu'ils se bloquent entre eux.

Les échecs sont rejoués avec un backoff exponentiel, plafonné à trois tentatives. Un balayage des verrous périmés remet en attente les jobs restés aux mains d'un worker qui a planté.

Aucun broker de messages n'a été ajouté. La base était déjà là, déjà transactionnelle, déjà sauvegardée. `SKIP LOCKED` est précisément la primitive dont une file de travail a besoin. Cela fait un système de moins à exploiter, superviser et restaurer à 3 h du matin.

### L'échelle des variantes : développement contre production

Deux familles de variantes coexistent, une par environnement, et elles ne se correspondent pas. Le développement produit cinq largeurs ; la production en produit quatre, nommées d'après des appareils plutôt que d'après des tailles.

```js
Inputs.table(variants, {
  columns: ["environment", "variant", "edge_px", "purpose_fr"],
  header: {environment: "Environnement", variant: "Variante", edge_px: "Grand côté (px)", purpose_fr: "Usage"},
  rows: 10
})
```

Cette divergence est un vrai défaut. Une variante définie en développement mais absente en production, c'est une URL qui résout en local et renvoie un 404 en ligne. La correction ne coûte presque rien : une liste de configuration à promouvoir. C'est typiquement ce qu'une revue de code met au jour et qu'une démonstration laisse passer.

## La publication : là où les opérateurs reprennent la main

La première version de cette plateforme synchronisait l'edge de la manière la plus évidente : des triggers de base de données se déclenchaient à chaque changement de ligne et mettaient en file une tâche de synchronisation par clé concernée.

Ce mécanisme pesait **28 triggers et 18 fonctions.** Une seule migration l'a supprimé, et son nom dit exactement ce qu'elle fait : `remove_kv_sync_triggers_add_catalog_publishes`. Les écritures edge ne proviennent plus que d'une action de publication explicite. Elles sont groupées en écritures multi-clés et réconciliées avec un hash de contenu stocké par entité.

Pourquoi ? Parce que le trigger par ligne échoue pour une raison qui ne tient pas à la correction, mais au fan-out. Modifier un produit ne produit pas une écriture edge, mais plusieurs. La clé du produit change, et avec elle chaque collection et chaque index où il apparaît : l'ensemble des produits, l'index de sa catégorie, celui de sa marque, l'index de recherche. Un rédacteur qui corrige cinq coquilles en un après-midi génère un volume d'écritures proportionnel à la *forme du catalogue*, pas à la taille de ses modifications.

### La publication se comporte comme un commit

L'application `back-office` transforme la publication en un workflow de type Git, que les opérateurs connaissent déjà :

<div class="verified">La prévisualisation calcule le hash de contenu de chaque entité active, le compare au hash stocké et renvoie un diff : ajouts, mises à jour, suppressions, plus les avertissements. La publication, elle, écrit une ligne dans la table des publications, construit toutes les structures edge, les écrit par lots, met à jour les hashes stockés, écrit le marqueur de version, puis archive le résultat avec ses décomptes, sa durée et une note en texte libre. L'historique liste toutes les publications passées, avec leur version, leur diff et leur auteur.</div>

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
    <text x="500" y="34" text-anchor="middle" font-size="11" opacity="0.7">une version publiée, on peut la désigner</text>
  </g>
</svg>

Le vocabulaire est choisi. Un opérateur qui a déjà utilisé un gestionnaire de versions sait ce que veulent dire prévisualiser, publier et historique. Le diff rend visible la portée d'un changement *avant* qu'il n'atteigne un acheteur.

Avec un trigger, à l'inverse, le changement est déjà en ligne au moment où quelqu'un aurait pu le relire.

### Ce que contient l'instantané

La carte des clés ci-dessous se lit dans le publieur comme dans le lecteur edge. Un changement de slug laisse une pierre tombale dans l'index des slugs, qui résout vers une redirection : une ancienne URL de produit partagée sur WhatsApp ne devient pas un 404.

```js
Inputs.table(kvKeys, {
  columns: ["key", "shape", "read_by", "role_fr"],
  header: {key: "Clé", shape: "Forme", read_by: "Lue par", role_fr: "Rôle"},
  width: {key: 300, role_fr: 280},
  rows: 12
})
```

À la lecture, le worker edge charge ces clés en parallèle et dénormalise les références — producteur, régions, notes de dégustation, récompenses — en objets imbriqués, avec un repli sur le préfixe de nom pour les enregistrements dont les identifiants ont dérivé.

**La boutique ne fait jamais de jointure.** La jointure a déjà eu lieu à la publication.

## Le back-office : le contrôle opérateur sur la couche de desserte

L'application `back-office`, écrite avec React, Vite et Ant Design, est le poste de commande depuis lequel l'entreprise pilote toute la couche de desserte. On y trouve :

- **Gestion du catalogue** (`CatalogManagement.tsx`) : le workflow de publication de type Git, avec prévisualisation, diff et historique. L'opérateur voit exactement ce qui va changer avant la mise en ligne.
- **Tableau de bord média** : l'état en temps réel des jobs de traitement d'images, avec relance et annulation. On suit quels originaux sont en cours, quelles variantes ont été générées et lesquelles ont échoué.
- **État de synchronisation** : la supervision des jobs de fond qui alimentent le pipeline média et la publication du catalogue. `syncJobStorage` et le pool de workers sont entièrement observables.
- **Inspecteur KV** : la lecture directe du catalogue publié dans Cloudflare KV, pour vérifier que la dernière publication est bien arrivée à l'edge.
- **Historique des versions** : la piste d'audit complète de chaque publication — horodatage, auteur, note de commit et statistiques de ce qui a changé.

Ce n'est pas une simple interface CRUD. C'est un **plan de contrôle** de la couche de desserte, pensé pour des opérateurs qui doivent comprendre et piloter un système qui sert des clients dans toute l'Afrique centrale.

## Ce que l'on y gagne, concrètement

- **Une fiche produit devient une lecture de clé** sur un point de présence proche de l'acheteur, et non un aller-retour vers une base située sur un autre continent. Là où les données mobiles coûtent réellement de l'argent, ce n'est pas un agrément : c'est une condition.

- **Les rédacteurs voient l'ensemble exact des changements** qu'une publication va produire, avant qu'elle ne les produise ; et ils peuvent désigner la version qui a introduit une régression. Fini le « mais ça marchait en staging » : staging et production passent par le même mécanisme de publication.

- **Le volume d'écritures edge est découplé de l'activité éditoriale.** Un import en masse ne se traduit ni en facture ni en limitation de débit. L'entreprise peut faire 100 modifications dans la journée sans surveiller ses coûts Cloudflare.

- **Toute la zone publiée peut être supprimée puis reconstruite** depuis la source relationnelle. La reprise devient une procédure au lieu d'un incident : en cas de problème, il reste toujours la republication complète.

## La suite

Héberger sa propre boutique à l'edge a une conséquence que cette plateforme assume pleinement. Chaque requête passe déjà par un serveur que l'opérateur contrôle, sur son propre domaine, porteur de son propre cookie first-party. Et ce serveur sait déjà quel instantané de catalogue il a servi.

La [**partie 3 — Edge e-commerce: Signal first-party, sans tracker**](https://computeflux.xyz/studies/first-party-signal-dco-newsletter) transforme ce flux de requêtes en cohortes k-anonymes calculées côté serveur, puis ces cohortes en une newsletter qui s'assemble destinataire par destinataire à partir du catalogue publié que lit la boutique.

---

<div class="small muted">Les chiffres présentés ici comme des modèles sont calculés à partir des paramètres ci-dessus : ils décrivent la forme d'un problème, pas le trafic de cet opérateur. Les comportements présentés comme lus dans le code ont été vérifiés à la source. Le client, la plateforme et ses domaines sont volontairement passés sous silence.</div>

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
