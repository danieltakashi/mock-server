const fs = require('fs')

console.json        = (obj) => console.log(JSON.stringify(obj, null, 2)); 

const wrapItem      = (model, id) => ({model: model, id: id});
const wrapResult    = (model, result) => ({ model: model, result: result })

const search        = (model, id) => (model && id) ? payload(model).find(item => item.id == id) : payload(model)
const modelProperty = (item) => Object.keys(item).filter(prop => MODELS.some(model => model == prop))
const pathJoin      = (path, name) => [path, name].join('/');

const payload = (model, path) => {
  var payloadDir = !path ? './payloads/' : path
  var filename = pathJoin(payloadDir , model+'.json')
  var rawdata = fs.readFileSync(filename)
  return JSON.parse(rawdata)
}

const findModels = (path) => {
  var files = []
  
  var folderItems = fs.readdirSync(path)
  var files = folderItems.filter(name => fs.lstatSync(pathJoin(path, name)).isFile())
  var folder = folderItems.filter(name => fs.lstatSync(pathJoin(path, name)).isDirectory())
  var innerFiles = folder.map(name => findModels(pathJoin(path, name)))
  
  var models = files.concat(innerFiles).flat()
  models = models.filter(filename => filename.match(".json$")).map(name => name.split('.')[0])
  
  return models;
}
const MODELS = findModels('./payloads');

const queryPath = (path) => {
  var pathArray = path.toLowerCase().split('/').filter(i => i);
  var query = []

  while(pathArray.length > 0)
    query.push(wrapItem(pathArray.shift(), pathArray.shift()))

  return query;
}

const searchItem = (item) => {
  var queryResult = search(item.model, item.id)
  return (queryResult.length > 0) ?
    queryResult.map(item => resolveForeignKeys(item)) : 
    resolveForeignKeys(queryResult);
}

const resolveForeignKeys = (record) => {
  var models = modelProperty(record)
  // console.json(models)
  var foreignKeys = {}

  models.forEach(fk => {
    foreignKeys[fk] = record[fk].map(id => wrapItem(fk, id))
  })

  Object.keys(foreignKeys).forEach(key => {
    record[key] = foreignKeys[key].map(item => searchItem(item))
  })

  return record;
}


const singleRecord = (itemObject) => {
  var searchResult = search(itemObject.model, itemObject.id)
  if (!searchResult) return []

  if (!itemObject.id) {
    searchResult.forEach(item => resolveForeignKeys(item))
  } else {
    resolveForeignKeys(searchResult)
  }
  return searchResult
}

const linkedRecords = (linkRecords) => {
  var queries = []
  var keepSearching = true
  linkRecords.forEach(queryItem => {
    if ( keepSearching ) {
      var model = queryItem.model
      if (queries.length == 0) {
        queries = wrapResult(queryItem.model, singleRecord(queryItem))

      } else if (!queryItem.id) {
        queries = queries.result[model]

      } else {
        var results = singleRecord(queryItem)
        var newqueries = wrapResult(queryItem.model, results)

        var filterHere = queries.result[newqueries.model]
        if(filterHere.length == 0 || !filterHere) {

          queries = []
          keepSearching = false
        } else {
          var qr = queries.result[queryItem.model]

          var newId = newqueries.result.id;
          var matches = qr.some(item => item.id == newId)
          if (matches) queries = newqueries
          else { keepSearching = false ; queries = []}
        }
      }
    }
  })
  
  if (!queries) return []
  if (queries.result) { queries = queries.result }

  return queries
}

const wrapperIndex = (path) => {
  const queryItems = queryPath(path)
  return linkedRecords(queryItems)
}

console.json(wrapperIndex(process.argv[2]))

module.exports = wrapperIndex;