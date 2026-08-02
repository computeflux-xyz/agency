---
title: Étude modèle
toc: false
---

```js
// Référencé pour que la couverture soit livrée dans dist/ ; site-api la résout
// comme image de couverture de l'étude.
const cover = FileAttachment("../cover.svg");
```

# Étude modèle

Une étude de cas [Observable Framework](https://observablehq.com/framework)
minimale. Remplacez ce contenu, mettez à jour `../../study.json`, puis publiez
avec l'action GitHub `publish-content`.

<div class="client-strip">
  <div class="field"><span class="k">Secteur</span><span class="v">—</span></div>
  <div class="field"><span class="k">Marché</span><span class="v">—</span></div>
  <div class="field"><span class="k">Surfaces</span><span class="v">—</span></div>
  <div class="field"><span class="k">Mission</span><span class="v">—</span></div>
</div>

Une étude raconte l'histoire d'un *client* : le lecteur doit donc toujours savoir
d'où vient une affirmation. Trois encarts portent cette distinction, et c'est la
raison d'être de `studies/_shared` :

<div class="verified">Ce qui figure dans cet encart a été lu dans le code livré :
un fichier, une migration, une clé de configuration, une fonction.</div>

<div class="modelled">Ce qui figure dans cet encart est piloté par les curseurs
de la page. C'est un modèle pédagogique, pas une mesure du trafic du client.</div>

<div class="proposed">Ce qui figure dans cet encart est une conception que nous
proposons par-dessus l'existant. Ce n'est pas en production.</div>

<div class="card">
  Le contenu interactif Observable s'affiche ici — graphiques, entrées, chargeurs
  de données ; tous les assets sont livrés dans un arbre <code>dist/</code>
  autonome.
</div>

<style>
/* French labels for the provenance callouts defined in studies/_shared. */
:root { --cb-verified: "Lu dans le code livré"; --cb-modelled: "Un modèle, pas une mesure"; --cb-proposed: "Proposé, pas déployé"; }
</style>
