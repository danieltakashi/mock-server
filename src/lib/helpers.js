export const isArray = (item) => typeof item.forEach === 'function';

export const isObject = (item) =>
  Object.keys(item).length > 1 && !isArray(item);

export const wrapItem = (model, id) => ({ model: model, id: id });

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
