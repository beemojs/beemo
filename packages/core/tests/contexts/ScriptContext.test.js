import ScriptContext from '../../src/contexts/ScriptContext';
import Script from '../../src/Script';

describe('Context', () => {
  let context;

  beforeEach(() => {
    context = new ScriptContext({});
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new ScriptContext({ foo: true });

      expect(context.args).toEqual({ foo: true });
    });

    it('sets script name', () => {
      context = new ScriptContext({ foo: true }, 'foo');

      expect(context.scriptName).toBe('foo');
    });
  });

  describe('setScript()', () => {
    it('sets script object and name', () => {
      const script = new Script();
      script.name = 'foo';

      context.setScript(script);

      expect(context.script).toBe(script);
      expect(context.scriptName).toBe('foo');
    });

    it('sets file path', () => {
      const script = new Script();
      script.name = 'foo';

      context.setScript(script, './foo.js');

      expect(context.scriptPath).toBe('./foo.js');
    });
  });
});
