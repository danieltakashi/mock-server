'use strict';

import fs from 'fs';
import path from 'path';
import { FILE, DIRECTORY, CACHE_DIRECTORY } from './constants.js';
import { resourceFileName } from './resources.handler.js';

export const jsonWrite = (model, diff) =>
  fs.writeFileSync(
    path.join(CACHE_DIRECTORY, resourceFileName(model)),
    JSON.stringify(diff)
  );

export const jsonRead = (filename) => JSON.parse(fs.readFileSync(filename));

export const findByType = (directory, type = null) => {
  const items = fs.readdirSync(directory);

  const filename = (directory, name) =>
    fs.lstatSync(path.join(directory, name));

  if (type === FILE)
    return items.filter((name) => filename(directory, name).isFile());
  if (type === DIRECTORY)
    return items.filter((name) => filename(directory, name).isDirectory());

  return undefined;
};

export const resourcesNames = (directory) => {
  const files = findByType(directory, FILE) || [];
  const folders = findByType(directory, DIRECTORY) || [];

  const innerFiles = folders.map((name) =>
    resourcesNames(path.join(directory, name))
  );

  let models = files.concat(innerFiles).flat();

  models = models
    .filter((filename) => filename.match('.json$'))
    .map((name) => name.split('.')[0]);

  return models;
};
