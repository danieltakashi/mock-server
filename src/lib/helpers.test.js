import { isArray, isObject, wrapItem, queryPath } from './helpers.js';

describe('HELPER: ', () => {
  describe('isArray: ', () => {
    it('Should verify an Array', () => {
      const array = [1];

      expect(isArray(array)).toBeTruthy();
    });

    it('Should verify an Array', () => {
      const object = { num: 1 };

      expect(isArray(object)).toBeFalsy();
    });
  });

  describe('isObject: ', () => {
    it('Should NOT verify an Array', () => {
      const array = [1];

      expect(isObject(array)).toBeFalsy();
    });

    it('Should verify an Object', () => {
      const object = { num: '1' };

      expect(isObject(object)).toBeTruthy();
    });
  });

  describe('wrapItem: ', () => {
    it('Should return a Model Id item', () => {
      const item = { model: 'model', id: '1' };
      const result = wrapItem('model', '1');

      expect(JSON.stringify(result)).toBe(JSON.stringify(item));
    });
  });

  describe('queryPath: ', () => {
    it('Should return an { Model Id } Object Array', () => {
      const urlPath = '/user';
      const result = queryPath(urlPath);

      expect(result.length).toBe(1);
      expect(result[0].model).toBe('user');
      expect(result[0].id).toBe(undefined);
    });
  });
});
