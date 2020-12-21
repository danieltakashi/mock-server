'use strict';
import fs from 'fs';
import path from 'path';
const readJson = (filename) => JSON.parse(fs.readFileSync(filename));

const payloadConfig = readJson('./package.json').payloads;
const PAYLOAD_DIRECTORY =
  payloadConfig && payloadConfig.directory
    ? payloadConfig.directory
    : './payloads';
const CACHE_DIRECTORY =
  payloadConfig && payloadConfig.cache
    ? payloadConfig.cache
    : './payloads/cache';

//  FUNCTION DEFINITIONS //

export const wrapItem = (model, id) => ({ model: model, id: id });
const modelProperty = (item) =>
  Object.keys(item).filter((prop) => MODELS.some((model) => model == prop));
export const modelProperties = (item) => Object.keys(item);
const modelFile = (model) => model + '.json';
export const writefile = (model, diff) =>
  fs.writeFileSync(
    path.join(CACHE_DIRECTORY, modelFile(model)),
    JSON.stringify(diff)
  );

const isDeleted = (item) =>
  modelProperties(item) &&
  modelProperties(item)[0] == 'id' &&
  modelProperties(item).length == 1;
const isArray = (item) => typeof item.forEach === 'function';
const isObject = (item) =>
  Object.keys(item).length > 1 && !isArray(item);

const findModels = (directory) => {
  let files = [];

  const items = fs.readdirSync(directory);
  files = items.filter((name) =>
    fs.lstatSync(path.join(directory, name)).isFile()
  );
  const folders = items.filter((name) =>
    fs.lstatSync(path.join(directory, name)).isDirectory()
  );
  const innerFiles = folders.map((name) =>
    findModels(path.join(directory, name))
  );

  let models = files.concat(innerFiles).flat();
  models = models
    .filter((filename) => filename.match('.json$'))
    .map((name) => name.split('.')[0]);

  return models;
};

const MODELS = findModels(PAYLOAD_DIRECTORY);

export const findAll = (model) => {
  try {
    return removeDeletedItems(payload(model));
  } catch (err) {
    return undefined;
  }
};

export const findItem = (model, id) => {
  if (model && id) {
    const record = payload(model).find((item) => item.id == id);
    if (isDeleted(record)) return undefined;

    return record;
  } else {
    return undefined;
  }
};

const removeDeletedItems = (records) => {
  const newResult = [];
  records.forEach((item) => {
    if (!isDeleted(item)) newResult.push(item);
  });
  return newResult;
};

const payload = (model) => {
  const baseModel = path.join(PAYLOAD_DIRECTORY, modelFile(model));
  const diffModel = path.join(CACHE_DIRECTORY, modelFile(model));
  const baseObject = fs.existsSync(baseModel) ? readJson(baseModel) : undefined;
  const diffObject = fs.existsSync(diffModel) ? readJson(diffModel) : undefined;

  if (!diffObject) return baseObject;

  // UPDATE original entries with DIFF
  for (let idx = 0; idx < baseObject.length; idx++) {
    const newItem = diffObject.filter(
      (diffItem) => diffItem.id == baseObject[idx].id
    )[0];
    if (newItem) baseObject[idx] = newItem;
  }

  // ADD DIFF / New entries
  for (let idx = 0; idx < diffObject.length; idx++) {
    const newItem = baseObject.filter(
      (diffItem) => diffItem.id == diffObject[idx].id
    )[0];
    if (!newItem) baseObject.push(diffObject[idx]);
  }

  return baseObject;
};

export const queryPath = (queryPath) => {
  const pathArray = queryPath
    .toLowerCase()
    .split('/')
    .filter((i) => i);
  const query = [];

  while (pathArray.length > 0) {
    query.push(wrapItem(pathArray.shift(), pathArray.shift()));
  }

  return query;
};

const resolveForeignKeys = (record) => {
  const models = modelProperty(record);
  const foreignKeys = {};

  models.forEach((fk) => {
    foreignKeys[fk] = record[fk].map((id) => wrapItem(fk, id));
  });

  Object.keys(foreignKeys).forEach((key) => {
    record[key] = foreignKeys[key]
      .map((item) => {
        const record = findItem(item.model, item.id);

        // remove deleted items
        if (!record || isDeleted(record)) return null;

        return resolveForeignKeys(record);
      })
      .filter((item) => item);
  });

  // clear empty references
  Object.keys(record).forEach((prop) => {
    if (isArray(record[prop]) && record[prop].length == 0) {
      delete record[prop];
    }
  });

  return record;
};

const linkedRecords = (linkRecords) => {
  const queries = [];
  let records;
  let keepSearching = true;

  linkRecords.forEach((queryItem) => {
    // collections
    if (!queryItem.id) {
      records = findAll(queryItem.model);
      records.forEach((item) => resolveForeignKeys(item));
      queries.push(records);
    } else {
      // single item
      records = findItem(queryItem.model, queryItem.id);
      if (records === undefined) queries.push(undefined);
      else {
        resolveForeignKeys(records);
        queries.push(records);
      }
    }
  });

  // LAST ITEM RETURNED undefined
  if (queries.pop() === undefined) return [];

  queries.forEach((item, idx) => {
    const current = item;
    const nextRecord = linkRecords[idx + 1];

    if (nextRecord && keepSearching) {
      keepSearching = current.id == nextRecord.id;
      records = current;
    } else if (!nextRecord && current) {
      records = current;
    }
  });

  return records;
};

export const wrapperIndex = (methodPath) => {
  const queryItems = queryPath(methodPath);
  return linkedRecords(queryItems);
};
