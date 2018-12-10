import Script from '../src/Script';

describe('Script', () => {
  let script: Script;

  beforeEach(() => {
    script = new Script('test', 'test');
  });

  describe('args()', () => {
    it('returns an empty object', () => {
      expect(script.args()).toEqual({});
    });
  });

  describe('execute()', () => {
    it('errors if not defined', () => {
      // @ts-ignore
      expect(script.execute()).rejects.toThrowErrorMatchingSnapshot();
    });
  });
});
