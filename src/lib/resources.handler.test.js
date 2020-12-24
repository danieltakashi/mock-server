import {
  resourceProperties,
  resourceFileName,
  resourceData,
  resourceAll,
  resourceItem,
  resolveForeignKeys,
  queryFind
} from './resources.handler.js';
import { isObject, isArray } from './helpers';

describe('Resources Handler: ', () => {
  describe('resourceProperties: ', () => {
    it('Should return object properties', () => {
      const obj = { id: 1, name: 'test', product: 'product name' };
      const expected = Object.keys(obj);
      const result = resourceProperties(obj);

      expect(expected).toEqual(expect.arrayContaining(result));
      expect(isObject(obj)).toBeTruthy()
      expect(isArray(obj)).toBeFalsy()
      result.map(item => parseInt(item)).forEach(item => {
        expect(item).toBeNaN()
      })
    });

    it('Should NOT return array properties', () => {
      const obj = [1, 2, 3];
      const result = resourceProperties(obj)

      result.forEach(item => {
        expect(typeof item).not.toBe('number')
      })
    });
  });

  describe('resourceFileName: ', () => {
    it('Should return a file name', () => {
      const name = 'model'
      const expected = resourceFileName(name)

      expect(expected).toBe(name + '.json')
    })

    it('Should return undefined if name not provided', () => {
      const name = undefined
      const expected = resourceFileName(name)

      expect(expected).toBeUndefined()
    })
  })

});
