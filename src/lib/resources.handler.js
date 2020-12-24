'use strict';
import fs from 'fs';
import path from 'path';
import { PAYLOAD_DIRECTORY, CACHE_DIRECTORY, MODELS } from './constants.js';
import { jsonRead } from './storage.handler.js';
import { isArray, wrapItem } from './lambdas.js';
export const resourceProperties = (item) => Object.keys(item);
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

export const resourceFileName = (model) => model + '.json';
export const resourcesData = (model) => {
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

export const resourcesItem = (model, id) => {
  if (model && id) {
    const record = resourcesData(model).find((item) => item.id === id);
    if (isDeleted(record)) return undefined;

    return record;
  } else {
    return undefined;
  }
};

export const resolveForeignKeys = (record) => {
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
        const record = resourcesItem(item.model, item.id);

        // remove deleted items
        if (!record || isDeleted(record)) return null;

        return resolveForeignKeys(record);
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

export const resourcesAll = (model) => {
  try {
    const data = resourcesData(model);

    return removeDeletedItems(data);
  } catch (err) {
    return undefined;
  }
};
