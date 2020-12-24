'use strict';
import { jsonRead, resourcesNames } from './storage.handler.js';
// import { resourcesNames } from './dataHandler.js';

export const FILE = 'FILE';
export const DIRECTORY = 'DIRECTORY';
export const payloadConfig = jsonRead('./package.json').payloads;

export const PAYLOAD_DIRECTORY =
  payloadConfig && payloadConfig.directory
    ? payloadConfig.directory
    : './payloads';

export const CACHE_DIRECTORY =
  payloadConfig && payloadConfig.cache
    ? payloadConfig.cache
    : './payloads/cache';

export const MODELS = resourcesNames(PAYLOAD_DIRECTORY);
