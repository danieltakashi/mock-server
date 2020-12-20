const fs = require('fs')

const splitPath   = (path)      => path.split('/').filter(item => item);
const findModels  = (splitPath) => splitPath.filter((_, index) => index % 2 == 0);
const findIds     = (splitPath) => splitPath.filter((_, index) => index % 2 == 1);
const mapModelId  = (model, id) => ({model: model, id: id});
const findItem    = (model, id) => (model&&id) ? payload(model).find(item => item.id == id) : void (0);
const findAll     = (model)     => (model) ? payload(model) : void (0);
const search  = (model, id) => (id) ? findItem(model, id) : findAll(model).map((entry) => match(entry));
const byQuery = (sq)        => sq.map(item => search(item.model, item.id));

const payload = (model) => {
  var payloadDir = './payloads/'
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
  console.log(">>> ", f, path)
  var query = []

  while(f.length > 0) {
    var model = f.shift()
    var id = f.shift()
    var item = mapModelId(model, id)
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

const reducer = (acc, cur) => {
  let model = Object.keys(cur).filter(property => MODELS.some(model => model == property))
  model = model[0]
  cur[model] = cur[model].map(id => {
    if('function'===typeof(acc.filter)) return acc.filter(item => item.id == id)[0]
    if(acc.id == id) return acc
    return void(0)
  })
  return cur 
}
const payloadGenerator = (path) => byQuery(queryPath(path)).reverse().reduce(reducer)



const MODELS = folderModels('./payloads');

// var uri = '/products/2/brands';
// console.log(payloadGen(uri))
// console.log(queryPath(uri))

module.exports = payloadGenerator;