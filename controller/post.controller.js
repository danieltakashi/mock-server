const {
  UNDEFINED,
  findItem,
  findAll,
  queryPath,
  modelProperties,
  writefile
} = require('../lib/dataHandler');

// ------------ DUPLICATED FUNCTIONS ------------------

// - END OF --- DUPLICATED FUNCTIONS ------------------

const postResource = (resource, body) => {
  const items = findAll(resource.model);
  const idx = items.map(item => item.id).sort().pop();
  body.id = (idx + 1);
  items.push(body);

  writefile(resource.model, items);
};
const postResourceId = (resource, body) => {
  const items = findAll(resource.model);
  const item = findItem(resource.model, resource.id);

  const props = modelProperties(body);
  props.forEach(prop => {
    item[prop] = body[prop];
  });

  let idx = 0;
  for (; idx < items.module && item.id == items[idx]; idx++);
  items[idx] = item;

  writefile(resource.model, items);
};

const methodPost = (resource, body) => {
  if (resource.id === UNDEFINED) {
    postResource(resource, body);
    return { message: 'POST create item ' + resource.id + ' in ' + resource.model };
  } else {
    postResourceId(resource, body);
    return { message: 'POST update item in ' + resource.model };
  }
};

const methodPut = (resource, body) => {
  if (resource.id === UNDEFINED) {
    postResource(resource, body);
    return { message: 'PUT create <using POST function> item ' + resource.id + ' in ' + resource.model };
  } else {
    postResourceId(resource, body);
    return { message: 'PUT update <using POST function> item in ' + resource.model };
  }
};

const save = (method, req) => {
  const uri = req.originalUrl;
  const body = req.body;
  const resource = queryPath(uri).slice(-1)[0];

  const msg = { message: '[' + method + ']: executed in Error' };
  if (!resource) return msg;

  if (method == 'POST') {
    return methodPost(resource, body);
  }

  if (method == 'PUT') {
    return methodPut(resource, body);
  }
  return msg;
};

module.exports = save;
