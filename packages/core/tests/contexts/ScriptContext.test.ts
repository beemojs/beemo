import ScriptContext from '../../src/contexts/ScriptContext';
import Script from '../../src/Script';
import { MOCK_SCRIPT_ARGS } from '../../../../tests/helpers';

describe('ScriptContext', () => {
  let context: ScriptContext;

  beforeEach(() => {
    context = new ScriptContext({ ...MOCK_SCRIPT_ARGS }, 'foo');
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new ScriptContext({ ...MOCK_SCRIPT_ARGS, foo: true }, 'foo');

      expect(context.args).toEqual({ ...MOCK_SCRIPT_ARGS, foo: true });
    });

    it('sets script name', () => {
      expect(context.scriptName).toBe('Foo');
    });

    it('converts name to pascal case', () => {
      context = new ScriptContext({ ...MOCK_SCRIPT_ARGS, foo: true }, 'foo-bar');

      expect(context.scriptName).toBe('FooBar');
      expect(context.eventName).toBe('foo-bar');
    });
  });

  describe('setScript()', () => {
    it('sets script object, name, and path', () => {
      const script = new Script('foo', 'Title');

      context.setScript(script, './foo.js');

      expect(context.script).toBe(script);
      expect(context.path).toBe('./foo.js');
    });
  });
});
