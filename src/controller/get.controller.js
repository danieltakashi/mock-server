import HttpStatus from 'http-status-codes';

import { queryPath } from '../lib/helpers.js';
import { queryFind, resolveForeignKeys } from "../lib/resources.handler.js";

export const get = (req, res) => {
  const queries = queryPath(req.originalUrl)
  const resourceName = queries[queries.length -1].model;

  const resource = queryFind(queries)
  const data = resolveForeignKeys(resource);
  const response = {
    data: data,
    code: (!data || data.length === 0 ? HttpStatus.NO_CONTENT : HttpStatus.OK),
    message: resourceName + ': fetched successfully'
  }

  return response;
};

export default get;
