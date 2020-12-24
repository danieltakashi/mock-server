import { queryPath } from '../lib/helpers.js';
import { queryFind, resolveForeignKeys } from "../lib/resources.handler.js";

export const get = (req, res) => {
  const queries = queryPath(req.originalUrl)
  const resource = queryFind(queries)
  const data = resolveForeignKeys(resource);
  
  return !data ? '' : data;
};

export default get;
