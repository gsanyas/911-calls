# 911 Calls avec MongoDB

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```shell
use 911-calls
db.calls.count()
```

## Index géographique et index textuel

Afin de répondre aux différents problèmes, vous allez avoir besoin de créer deux index particuliers sur la collection des appels :

* Un index géographique de type `2dsphere` pour les coordonnées GPS des appels.
  * https://docs.mongodb.com/manual/core/2dsphere/#create-a-2dsphere-index
* Un index textuel sur le titre des appels pour pouvoir faire des recherches full-text sur ce champ (recherche des overdoses par exemple)
  * https://docs.mongodb.com/manual/core/index-text/#create-text-index

## Requêtes

À vous de jouer ! Écrivez les requêtes MongoDB permettant de résoudre les problèmes posés.

Compter le nombre d'appels par catégorie

```shell
db.calls.createIndex( { title: "text" } )
db.calls.aggregate([
  { $match: ({ $text: { $search: "EMS:" } }) },
  { $count : 'EMS' }
])
db.calls.aggregate([
  { $match: ({ $text: { $search: "Fire:" } }) },
  { $count : 'Fire' }
])
db.calls.aggregate([
  { $match: ({ $text: { $search: "Traffic:" } }) },
  { $count : 'Traffic' }
])
```

Trouver les 3 mois ayant comptabilisés le plus d'appels

```shell
db.calls.aggregate([
  {$group:{_id:{$substr: ['$timeStamp', 0, 7]}, total:{$sum:1}}},
  {$sort: {total: -1}},
  {$limit: 3}
])
```

Trouver le top 3 des villes avec le plus d'appels pour overdose

```shell
db.calls.aggregate([
  { $match: ({title: 'EMS: OVERDOSE'}) },
  { $group: {_id: '$twp', total:{$sum:1} } },
  { $sort: {total: -1}},
  { $limit: 3 }
])
```

Vous allez sûrement avoir besoin de vous inspirer des points suivants de la documentation :

* Proximity search : https://docs.mongodb.com/manual/tutorial/query-a-2dsphere-index/#proximity-to-a-geojson-point
* Text search : https://docs.mongodb.com/manual/text-search/#text-operator
* Aggregation Pipeline : https://docs.mongodb.com/manual/core/aggregation-pipeline/
* Aggregation Operators : https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
