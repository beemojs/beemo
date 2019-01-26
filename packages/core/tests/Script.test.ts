import Script from '../src/Script';

describe('Script', () => {
  let script: Script;

  class TestScript extends Script {
    execute() {
      return Promise.resolve();
    }
  }

  beforeEach(() => {
    script = new TestScript();
  });

  describe('args()', () => {
    it('returns an empty object', () => {
      expect(script.args()).toEqual({});
    });
  });
});
