import ScriptContext from '../../src/contexts/ScriptContext';
import Script from '../../src/Script';

describe('Context', () => {
  let context: ScriptContext;

  beforeEach(() => {
    context = new ScriptContext({ _: [], $0: '' }, 'foo');
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new ScriptContext({ _: [], $0: '', foo: true }, 'foo');

      expect(context.args).toEqual({ _: [], $0: '', foo: true });
    });

    it('sets script name', () => {
      expect(context.scriptName).toBe('foo');
    });
  });

  describe('setScript()', () => {
    it('sets script object, name, and path', () => {
      const script = new Script('foo', 'Title');

      context.setScript(script, './foo.js');

      expect(context.script).toBe(script);
      expect(context.scriptName).toBe('foo');
      expect(context.scriptPath).toBe('./foo.js');
    });
  });
});
