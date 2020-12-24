import assert from 'assert';
import pkg from 'chai';
const { expect } = pkg;
import { isArray, isObject, wrapItem, queryPath } from './helpers.js';

describe('HELPER: ', () => {
  describe('isArray: ', () => {
    it('Should verify an Array', () => {
      const array = [1];

      expect(isArray(array)).to.be.true;
    });

    it('Should verify an Array', () => {
      const object = {num: 1};
      
      expect(isArray(object)).to.be.false;
    });
  });

  describe('isObject: ', () => {
    it('Should NOT verify an Array', () => {
      const array = [1];

      expect(isObject(array)).to.be.false;
    });

    it('Should verify an Object', () => {
      const object = { 'num': '1' };
      
      expect(isObject(object)).to.be.true;
    });
  });

  describe('wrapItem: ', () => {
    it('Should return a Model Id item', () => {
      const item = {model: 'model', id: '1'}
      const result = wrapItem('model', '1')

      expect(JSON.stringify(result)).to.be.equal(JSON.stringify(item));
    });
  });

  describe('queryPath: ', () => {
    it('Should return an { Model Id } Object Array', () => {
      const urlPath = '/user'
      const result = queryPath(urlPath)

      expect(result.length).to.be.equal(1);
      expect(result[0].model).to.be.equal('user');
      expect(result[0].id).to.be.undefined;
    });
  });
});