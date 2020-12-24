'use strict';

import {
  resourcesAll,
  resolveForeignKeys,
  resourcesItem
} from '../lib/resources.handler.js';
import { queryPath } from './lambdas.js';

//  FUNCTION DEFINITIONS //

const linkedRecords = (linkRecords) => {
  const queries = [];
  let records;
  let keepSearching = true;

  linkRecords.forEach((queryItem) => {
    // collections
    if (!queryItem.id) {
      records = resourcesAll(queryItem.model);
      records.forEach((item) => resolveForeignKeys(item));
      queries.push(records);
    } else {
      // single item
      records = resourcesItem(queryItem.model, queryItem.id);
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
      keepSearching = current.id === nextRecord.id;
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
