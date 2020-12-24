'use strict';
import { queryPath } from '../lib/lambdas.js';
import { jsonWrite } from '../lib/storage.handler.js';
import {
  resourcesItem,
  resourcesAll,
  resourceProperties
} from '../lib/resources.handler.js';

const postResource = (resource, body) => {
  const items = resourcesAll(resource.model);
  const idx = items
    .map((item) => item.id)
    .sort()
    .pop();
  body.id = idx + 1;
  items.push(body);

  jsonWrite(resource.model, items);
};
const postResourceId = (resource, body) => {
  const items = resourcesAll(resource.model);
  const item = resourcesItem(resource.model, resource.id);

  const props = resourceProperties(body);
  props.forEach((prop) => {
    item[prop] = body[prop];
  });

  let idx = 0;
  for (; idx < items.module && item.id === items[idx]; idx++);
  items[idx] = item;

  jsonWrite(resource.model, items);
};

export const methodPost = (resource, body) => {
  if (resource.id === undefined) {
    postResource(resource, body);
    return {
      message: 'POST create item ' + resource.id + ' in ' + resource.model
    };
  } else {
    postResourceId(resource, body);
    return { message: 'POST update item in ' + resource.model };
  }
};

export const methodPut = (resource, body) => {
  if (resource.id === undefined) {
    postResource(resource, body);
    return {
      message:
        'PUT create <using POST function> item ' +
        resource.id +
        ' in ' +
        resource.model
    };
  } else {
    postResourceId(resource, body);
    return {
      message: 'PUT update <using POST function> item in ' + resource.model
    };
  }
};

export const save = (method, req) => {
  const uri = req.originalUrl;
  const body = req.body;
  const resource = queryPath(uri).slice(-1)[0];

  const msg = { message: '[' + method + ']: executed in Error' };
  if (!resource) return msg;

  if (method === 'POST') {
    return methodPost(resource, body);
  }

  if (method === 'PUT') {
    return methodPut(resource, body);
  }
  return msg;
};

export default save;
