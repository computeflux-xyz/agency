---
title: Article modèle
toc: false
---

# Article modèle

Ceci est un article minimal [Observable Framework](https://observablehq.com/framework).
Remplacez ce contenu, mettez à jour `../../article.json`, puis publiez avec l'action
GitHub `publish-content`.

<!-- Les données/composants partagés sont référencés relativement à ce fichier :
     depuis src/fr/index.md, le dossier src/data/ est "../data/". -->

```js
const data = FileAttachment("../data/example.json").json();
```

<div class="card">
  Le contenu interactif Observable s'affiche ici — graphiques, entrées, chargeurs
  de données et tous les actifs sont livrés dans une arborescence
  <code>dist/</code> autonome.
</div>
