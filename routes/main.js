const fs = require('fs')

const wrapItem      = (model, id) => ({model: model, id: id});
const search        = (model, id) => (model && id) ? payload(model).find(item => item.id == id) : payload(model)
const modelProperty = (item) => Object.keys(item).filter(prop => MODELS.some(model => model == prop))

const payload = (model, path) => {
  var payloadDir = !path ? './payloads/' : path
  var filename = payloadDir + model+'.json'
  var rawdata = fs.readFileSync(filename)
  return JSON.parse(rawdata)
}

const findModels = (path) => {
  var files = []
  const pathJoin = (path, name) => [path, name].join('/');
  
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

const resolveForeignKeys = (item) => {
  var models = modelProperty(item)
  var foreignKeys = {}

  models.forEach(fk => {
    foreignKeys[fk] = item[fk].map(id => wrapItem(fk, id))
  })

  Object.keys(foreignKeys).forEach(key => {
    item[key] = foreignKeys[key].map(item => searchItem(item))
  })

  return item;
}

const index = (path) => {
  var queryEntry = queryPath(path)
  var prev = null
  var lastItem = null
  var filteredResult = null
  queryEntry.forEach(item => {
    lastItem = item
    var singleItem = search(item.model, item.id)
    
    if(prev === null) prev = singleItem;
    else if(prev[item.model] && prev[item.model].some(id => id == item.id)){
      prev = singleItem
    } else {
      filteredResult = prev[item.model].map(id => wrapItem(item.model, id))
      filteredResult = filteredResult.map(item => resolveForeignKeys(search(item.model, item.id)))
      prev = void(0)
    }

  })

  if (filteredResult) return filteredResult;
  if (prev) return resolveForeignKeys(search(lastItem.model, lastItem.id))
  return []
}


module.exports = index;