const fs = require('fs')

const wrapItem      = (model, id) => ({model: model, id: id});
const findItem      = (model, id) => (model && id) ? payload(model).find(item => item.id == id) : void(0);
const findAll       = (model)     => (model) ? payload(model) : void(0);
const search        = (model, id) => (model && id) ? findItem(model, id) : findAll(model)//.map((entry) => match(entry));
const modelProperty = (item) => Object.keys(item).filter(prop => MODELS.some(model => model == prop))


const payload = (model, path) => {
  var payloadDir = !path ? './payloads/' : path
  var filename = payloadDir + model+'.json'
  var rawdata = fs.readFileSync(filename)
  return JSON.parse(rawdata)
}

const folderModels = (path) => {
  var files = []
  const pathJoin = (path, name) => [path, name].join('/');
  
  var folderItems = fs.readdirSync(path)
  var files = folderItems.filter(name => fs.lstatSync(pathJoin(path, name)).isFile())
  var folder = folderItems.filter(name => fs.lstatSync(pathJoin(path, name)).isDirectory())
  var innerFiles = folder.map(name => folderModels(pathJoin(path, name)))
  
  var models = files.concat(innerFiles).flat()
  models = models.filter(filename => filename.match(".json$")).map(name => name.split('.')[0])
  
  return models;
}

const queryPath = (path) => {
  var f = path.toLowerCase().split('/').filter(i => i)
  var query = []

  while(f.length > 0) {
    var model = f.shift()
    var id = f.shift()
    var item = wrapItem(model, id)
    query.push(item)
  }

  return query;
}

const match = (record) => {
  const entry = record;
  const fks = Object.keys(record).filter(key => MODELS.some(model => model == key))

  fks.forEach(model => {
    entry[model] = entry[model].map(id => match(search(model, id)))
  })

  return entry
}

const MODELS = folderModels('./payloads');


const objects = (item) => {
  const normalizeItem = (item) => {
    var foreignKeys = {}
    var models = modelProperty(item)
    models.forEach(fk => {
      foreignKeys[fk] = item[fk].map(id => wrapItem(fk, id))
    })
    for( key in foreignKeys) {
      if (foreignKeys[key])
        foreignKeys[key] = foreignKeys[key].map(item => objects(item))
    }

    for( key in foreignKeys) {
      if (foreignKeys[key])
      item[key] = foreignKeys[key]
    }
    return item;
  }
  
  var result = search(item.model, item.id)

  return (result.length > 0) ? result.map(item => normalizeItem(item)) : normalizeItem(result);
}


const index = (path) => {
  try{
    var queryEntry = queryPath(path)
    var result = objects(queryEntry.shift())

    var curr = result;
    queryEntry.forEach(item => {
      var currenIteration = curr[item.model].filter(it => it.id == item.id)
      //if (currenIteration.length == 0) throw Error("Dont Match")
      curr[item.model] = currenIteration;
    })

    return result
  } catch (err) {
    return []
  }
}

module.exports = index;