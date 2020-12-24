import {
  FILE,
  DIRECTORY,
  PAYLOAD_DIRECTORY,
  CACHE_DIRECTORY,
  MODELS
} from './constants.js';

describe('CONSTANTS: ', () => {
  describe('FILE: ', () => {
    it(`Should be set to ${FILE}`, () => {
      expect(FILE).toBe('FILE');
    });
  });

  describe('DIRECTORY: ', () => {
    it(`Should be set to ${DIRECTORY}`, () => {
      expect(DIRECTORY).toBe('DIRECTORY');
    });
  });

  describe('CACHE_DIRECTORY: ', () => {
    it(`Should be set to ${CACHE_DIRECTORY}`, () => {
      expect(CACHE_DIRECTORY).toBe('./payloads/cache');
    });
  });

  describe('PAYLOAD_DIRECTORY: ', () => {
    it(`Should be set to ${PAYLOAD_DIRECTORY}`, () => {
      expect(PAYLOAD_DIRECTORY).toBe('./payloads');
    });
  });

  describe('MODELS: ', () => {
    it(`Should be set to ${MODELS}`, () => {
      const expected = ['brands', 'products', 'users'];
      expect(MODELS).toEqual(expect.arrayContaining(expected));
    });
  });
});
