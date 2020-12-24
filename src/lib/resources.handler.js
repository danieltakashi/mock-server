'use strict';

import fs from 'fs';
import path from 'path';
import { PAYLOAD_DIRECTORY, CACHE_DIRECTORY, MODELS } from './constants.js';
import { jsonRead } from './storage.handler.js';
import { isArray, wrapItem } from './helpers.js';

export const resourceProperties = (item) => Object.keys(item)
                                              .map(key => parseFloat(key) ? null : key)
                                              .filter(item => item);
const isDeleted = (item) =>
  resourceProperties(item) &&
  resourceProperties(item)[0] === 'id' &&
  resourceProperties(item).length === 1;

const removeDeletedItems = (records) => {
  const newResult = [];
  records.forEach((item) => {
    if (!isDeleted(item)) newResult.push(item);
  });
  return newResult;
};

export const resourceFileName = (model) => !model ? undefined : model + '.json';
export const resourceData = (model) => {
  const baseModel = path.join(PAYLOAD_DIRECTORY, resourceFileName(model));
  const diffModel = path.join(CACHE_DIRECTORY, resourceFileName(model));
  const baseObject = fs.existsSync(baseModel) ? jsonRead(baseModel) : undefined;
  const deltaObject = fs.existsSync(diffModel)
    ? jsonRead(diffModel)
    : undefined;

  if (!deltaObject) return baseObject;

  // UPDATE original entries with DIFF
  for (let idx = 0; idx < baseObject.length; idx++) {
    const newItem = deltaObject.filter(
      (delta) => delta.id === baseObject[idx].id
    )[0];

    if (newItem) baseObject[idx] = newItem;
  }

  // ADD DIFF / New entries
  for (let idx = 0; idx < deltaObject.length; idx++) {
    const newItem = baseObject.filter(
      (delta) => delta.id === deltaObject[idx].id
    )[0];

    if (!newItem) baseObject.push(deltaObject[idx]);
  }

  return baseObject;
};

export const resourceAll = (model) => {
  try {
    const data = resourceData(model);

    return removeDeletedItems(data);
  } catch (err) {
    return undefined;
  }
};

export const resourceItem = (model, id) => {
  let record = undefined;

  if (model && id) {
    record = resourceAll(model).filter(
      (resource) => resource.id == parseInt(id)
    )[0];
  }

  return record;
};

const _resolveForeignKeys = (record) => {
  const models = Object.keys(record).filter((prop) =>
    MODELS.some((model) => model === prop)
  );

  const foreignKeys = {};

  models.forEach((fk) => {
    foreignKeys[fk] = record[fk].map((id) => wrapItem(fk, id));
  });

  Object.keys(foreignKeys).forEach((key) => {
    record[key] = foreignKeys[key]
      .map((item) => {
        const record = resourceItem(item.model, item.id);

        // remove deleted items
        if (!record || isDeleted(record)) return null;

        return _resolveForeignKeys(record);
      })
      .filter((item) => item);
  });

  // clear empty references
  Object.keys(record).forEach((prop) => {
    if (isArray(record[prop]) && record[prop].length === 0) {
      delete record[prop];
    }
  });

  return record;
};

export const resolveForeignKeys = (item) => {
  if (!item) return undefined;

  return isArray(item)
    ? item.map((record) => _resolveForeignKeys(record))
    : _resolveForeignKeys(item);
};

export const queryFind = (query) => {
  let data = null;
  let keepSearching = true;

  if (query.length === 1) {
    const item = query[0];
    return !item.id
      ? resourceAll(item.model)
      : resourceItem(item.model, item.id);
  }

  for (let idx = 0; idx < query.length - 1 && keepSearching; idx++) {
    const item = query[idx];
    const nextResource = query[idx + 1];

    data = !item.id
      ? resourceAll(item.model)
      : resourceItem(item.model, item.id);

    if (!nextResource.id && data[nextResource.model]) {
      data = data[nextResource.model].map((id) =>
        resourceItem(nextResource.model, id)
      );
    } else {
      data = data[nextResource.model];

      if (!data) {
        keepSearching = false;
      } else {
        data = data.filter((id) => id == nextResource.id);
        data = data.map((id) => resourceItem(nextResource.model, id));
        keepSearching = data.length !== 0;
      }
    }
  }

  return keepSearching ? data : undefined;
};
