var fs = require('fs')

var payload = (model) => {
  var payloadDir = './payloads/'
  var filename = payloadDir + model+'.json'
  var rawdata = fs.readFileSync(filename)
  return JSON.parse(rawdata)
}

var folderModels = (path) => {
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
const MODELS = folderModels('./payloads');

var splitPath   = (path)      => path.split('/').filter(item => item);
var findModels  = (splitPath) => splitPath.filter((_, index) => index % 2 == 0);
var findIds     = (splitPath) => splitPath.filter((_, index) => index % 2 == 1);
var mapModelId  = (model, id) => ({model: model, id: id});
var findItem    = (model, id) => (model&&id) ? payload(model).find(item => item.id == id) : void (0);
var findAll     = (model)     => (model) ? payload(model) : void (0);

var match = (record) => {
  const entry = record;
  var keys = Object.keys(entry)
  var fks = keys.filter(key => MODELS.some(model => model == key))

  fks.forEach(model => {
    entry[model] = entry[model].map(id => search(model, id))
    entry[model] = entry[model].map(item => match(item))
  })

  return entry
}

var search = (model, id) => {
  if (id) {
    return findItem(model, id)
  } else {
    return findAll(model).map((entry) => match(entry))
  }
}




var uri = '/Users/1/Products/2/brands/';
//var uri = '/Users/';
var path = uri.toLowerCase()
var items = splitPath(path)
console.log(items)
// var result = search(items[0])
// console.log(MODELS)
// console.log(JSON.stringify(result))


// console.log(JSON.stringify(record))






var z = folderModels('./payloads')


