const fs = require('fs')
const path = require('path')
const payloadConfig = require('../package.json').payloads

const PAYLOAD_DIRECTORY = (payloadConfig && payloadConfig.directory) ? payloadConfig.directory : './payloads';
const CACHE_DIRECTORY   = (payloadConfig && payloadConfig.cache) ? payloadConfig.cache : './payloads/cache';
const UNDEFINED = void(0)

//  FUNCTION DEFINITIONS //
console.json          = (obj) => console.log(JSON.stringify(obj, null, 2)); 
const wrapItem        = (model, id) => ({model: model, id: id});
const modelProperty   = (item)      => Object.keys(item).filter(prop => MODELS.some(model => model == prop))
const modelProperties = (item)      => Object.keys(item)
const readJson        = (filename)  => JSON.parse(fs.readFileSync(filename))
const modelFile       = (model)     => model+'.json'

const writefile       = (model, diff)     =>  fs.writeFileSync(path.join(CACHE_DIRECTORY,modelFile(model)), JSON.stringify(diff));

const findAll  = (model) => { try { return removeDeleted(payload(model)) } catch (err) { return UNDEFINED } } ;
const findItem = (model, id) => {
  if (model && id) {
    var record = payload(model).find(item => item.id == id)
    if (isDeleted(record)) return UNDEFINED

    return record;
   } else return UNDEFINED;
}

const removeDeleted = (records) => {
  var newResult = []
  records.forEach(item => {
    if (!isDeleted(item)) newResult.push(item)
  })
  return newResult
}

const payload = (model) => {
  const baseModel = path.join(PAYLOAD_DIRECTORY , modelFile(model))
  const diffModel = path.join(CACHE_DIRECTORY , modelFile(model))
  const baseObject = fs.existsSync(baseModel) ? readJson(baseModel) : void(0)
  const diffObject = fs.existsSync(diffModel) ? readJson(diffModel) : void(0)

  if (!diffObject) return baseObject;

  // UPDATE original entries with DIFF
  for (var idx = 0; idx < baseObject.length; idx++) {
    var newItem = diffObject.filter(diffItem => diffItem.id == baseObject[idx].id)[0]
    if (newItem) baseObject[idx] = newItem
  }

  // ADD DIFF / New entries
  for (var idx = 0; idx < diffObject.length; idx++) {
    var newItem = baseObject.filter(diffItem => diffItem.id == diffObject[idx].id)[0]
    if (!newItem) baseObject.push(diffObject[idx])
  }

  return baseObject
}

const findModels = (directory) => {
  var files = []
  
  var items = fs.readdirSync(directory)
  var files  = items.filter(name => fs.lstatSync(path.join(directory, name)).isFile())
  var folders = items.filter(name => fs.lstatSync(path.join(directory, name)).isDirectory())
  var innerFiles = folders.map(name => findModels(path.join(directory, name)))
  
  var models = files.concat(innerFiles).flat()
  models = models.filter(filename => filename.match(".json$")).map(name => name.split('.')[0])
  
  return models;
}

const isDeleted = (item) => (properties = modelProperties(item)) && properties[0] == 'id' && properties.length == 1;
const isArray   = (item) => typeof item.forEach === 'function';
const isObject  = (item) => Object.keys(item).length > 1 && !isArray(item)

const MODELS = findModels(PAYLOAD_DIRECTORY);

const queryPath = (queryPath) => {
  var pathArray = queryPath.toLowerCase().split('/').filter(i => i);
  var query = []

  while(pathArray.length > 0)
    query.push(wrapItem(pathArray.shift(), pathArray.shift()))

  return query;
}


const resolveForeignKeys = (record) => {
  var models = modelProperty(record)
  var foreignKeys = {}
  
  models.forEach(fk => {
    foreignKeys[fk] = record[fk].map(id => wrapItem(fk, id))
  })
  
  Object.keys(foreignKeys).forEach(key => {
    record[key] = foreignKeys[key].map(item => {
      var record = findItem(item.model, item.id)

      // remove deleted items
      if (!record || isDeleted(record)) return null
      
      return resolveForeignKeys(record)
    }).filter(item => item)
  })

  // clear empty references
  Object.keys(record).forEach(prop => {
    if (isArray(record[prop]) && record[prop].length == 0) {
      delete record[prop]
    }
  })

  return record;
}

const linkedRecords = (linkRecords) => {
  var queries = []
  var records;
  var keepSearching = true

  linkRecords.forEach(queryItem => {
    // collections
    if ( !queryItem.id ) {
      records = findAll(queryItem.model);
      records.forEach(item => resolveForeignKeys(item))
      queries.push(records)
    }
    // single item
    else {
      records = findItem(queryItem.model, queryItem.id);
      if(records === UNDEFINED) queries.push(UNDEFINED)
      else {
        resolveForeignKeys(records)
        queries.push(records)
      }
    }
  })

  // LAST ITEM RETURNED UNDEFINED
  if ( queries.pop() === UNDEFINED ) return []

  queries.forEach((item, idx) => {
    var current = item
    var nextRecord = linkRecords[idx+1]

    if (nextRecord && keepSearching) {
      keepSearching = current.id == nextRecord.id
      records = current
    } else if (!nextRecord && current) {
      records = current
    }
  })

  return records
}

const wrapperIndex = (methodPath) => {
  const queryItems = queryPath(methodPath)
  return linkedRecords(queryItems)
}


module.exports = {
  'UNDEFINED': UNDEFINED,
  wrapItem: wrapItem,
  modelProperty: modelProperty,
  modelProperties: modelProperties,
  readJson: readJson,
  modelFile: modelFile,
  findAll: findAll,
  findItem: findItem,
  removeDeleted: removeDeleted,
  payload: payload,
  findModels: findModels,
  isDeleted: isDeleted,
  isArray: isArray,
  isObject: isObject,
  'MODELS': MODELS,
  queryPath: queryPath,
  resolveForeignKeys: resolveForeignKeys,
  linkedRecords: linkedRecords,
  writefile: writefile,
  wrapperIndex: wrapperIndex
}
