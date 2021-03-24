//const elasticsearch = require('elasticsearch');
const csv = require('csv-parser');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const ELASTIC_SEARCH_URI = 'http://localhost:9200';
const INDEX_NAME = '911-calls';

async function run() {
  const client = new Client({ node: ELASTIC_SEARCH_URI});

  // Drop index if exists
  await client.indices.delete({
    index: INDEX_NAME,
    ignore_unavailable: true
  });

  await client.indices.create({
    index: INDEX_NAME,
    body : {
      // TODO configurer l'index https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html
      mappings: {
        properties: {
          loc: {type: "geo_point"},
          desc: {type: "text"},
          zip: {type: "integer"},
          title: {type: "text"},
          timeStamp: {type: "date", format: "yyyy-MM-dd HH:mm:ss"},
          twp: {type: "text"},
          addr: {type: "text"},
          e: {type: "integer"}
        }
      }
    }
  });

  let calls = []

  fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => {
      const call = {
        loc: {"lat": data.lat,"lon": data.lng},
        desc: data.desc,
        zip: data.zip,
        title: data.title,
        timeStamp: data.timeStamp,
        twp: data.twp,
        addr: data.addr,
        e: data.e
      };
      // TODO créer l'objet call à partir de la ligne
      calls.push(call);
    })
    .on('end', async () => {
      // TODO insérer les données dans ES en utilisant l'API de bulk https://www.elastic.co/guide/en/elasticsearch/reference/7.x/docs-bulk.html
      const body = calls.flatMap(doc => [{ index: { _index: INDEX_NAME } }, doc])
      const { body: bulkResponse } = await client.bulk({body})
      // Error treatment based on elasticsearch javascript api docs
      if (bulkResponse.errors) {
        const erroredDocuments = []
        // The items array has the same order of the dataset we just indexed.
        // The presence of the `error` key indicates that the operation
        // that we did for the document has failed.
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0]
          if (action[operation].error) {
            erroredDocuments.push({
              // If the status is 429 it means that you can retry the document,
              // otherwise it's very likely a mapping error, and you should
              // fix the document before to try it again.
              status: action[operation].status,
              error: action[operation].error,
              operation: body[i * 2],
              document: body[i * 2 + 1]
            })
          }
        })
        console.log(erroredDocuments)
      }
    });
  

}

run().catch(console.log);


