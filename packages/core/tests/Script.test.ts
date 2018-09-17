import Script from '../src/Script';

describe('Script', () => {
  let script: Script;

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
      // @ts-ignore
      expect(script.run()).rejects.toThrowErrorMatchingSnapshot();
    });
  });
});
