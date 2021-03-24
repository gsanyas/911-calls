# 911 Calls avec ElasticSearch

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (ici aussi, cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```shell
GET <nom de votre index>/_count
```

## Requêtes

À vous de jouer ! Écrivez les requêtes ElasticSearch permettant de résoudre les problèmes posés.

### Compter le nombre d'appels par catégorie

En trois requêtes

```shell
GET 911-calls/_count
{
  "query": {
        "wildcard": {
           "title": {
              "value": "EMS*"
           }
        }
    }
}
GET 911-calls/_count
{
  "query": {
        "wildcard": {
           "title": {
              "value": "Fire*"
           }
        }
    }
}
GET 911-calls/_count
{
  "query": {
        "wildcard": {
           "title": {
              "value": "Traffic*"
           }
        }
    }
}
```

En une seule requête (champ `["total"]["value"]` dans chaque élément du champ `["responses"]`)

```shell
GET 911-calls/_msearch
{}
{"size":0,"track_total_hits":true,"query": {"wildcard": {"title": {"value": "EMS*"}}}}
{}
{"size":0,"track_total_hits":true,"query": {"wildcard": {"title": {"value": "Fire*"}}}}
{}
{"size":0,"track_total_hits":true,"query": {"wildcard": {"title": {"value": "Traffic*"}}}}
```

### Trouver les 3 mois ayant comptabilisés le plus d'appels

```shell
POST /911-calls/_search?size=10
{
  "aggs": {
    "calls_by_month": {
      "date_histogram": {
        "field": "timeStamp",
        "calendar_interval": "month"
      }
    }
  }
}
```

## Kibana

Dans Kibana, créez un dashboard qui permet de visualiser :

* Une carte de l'ensemble des appels
* Un histogramme des appels répartis par catégories
* Un Pie chart réparti par bimestre, par catégories et par canton (township)

Pour nous permettre d'évaluer votre travail, ajoutez une capture d'écran du dashboard dans ce répertoire [images](images).

### Bonus : Timelion
Timelion est un outil de visualisation des timeseries accessible via Kibana à l'aide du bouton : ![](images/timelion.png)

Réalisez le diagramme suivant :
![](images/timelion-chart.png)

Envoyer la réponse sous la forme de la requête Timelion ci-dessous:  

```
TODO : ajouter la requête Timelion ici
```
