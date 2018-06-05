import Script from '../src/Script';

describe('Script', () => {
  let script;

  beforeEach(() => {
    script = new Script();
  });

  describe('parse()', () => {
    it('returns an empty object', () => {
      expect(script.parse()).toEqual({});
    });
  });

  describe('run()', () => {
    it('errors if not defined', () => {
      expect(() => {
        script.run();
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
