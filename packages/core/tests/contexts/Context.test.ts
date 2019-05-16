import Context from '../../src/contexts/Context';
import { stubArgs } from '../../src/testUtils';

describe('Context', () => {
  let context: Context;

  beforeEach(() => {
    context = new Context(stubArgs());
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new Context(stubArgs({ stdio: 'pipe' }));

      expect(context.args).toEqual(stubArgs({ stdio: 'pipe' }));
    });
  });

  describe('addArg()', () => {
    it('can add positional args', () => {
      context.addArg('./foo');

      expect(context.argv).toEqual(['./foo']);
      expect(context.args['./foo']).toBeUndefined();
    });

    it('adds positional arg to yargs list', () => {
      context.addArg('./foo');

      expect(context.args._).toEqual(['./foo']);
    });
  });

  describe('addArgs()', () => {
    it('adds multiple arguments', () => {
      context.addArgs(['./foo', './bar']);

      expect(context.args._).toEqual(['./foo', './bar']);
    });
  });

  describe('addConfigPath()', () => {
    it('adds a config by name', () => {
      expect(context.configPaths).toEqual([]);

      context.addConfigPath('babel', './babel.config.js');

      expect(context.configPaths).toEqual([{ driver: 'babel', path: './babel.config.js' }]);
    });
  });

  describe('addOption()', () => {
    it('adds to argv and args', () => {
      context.addOption('--foo');

      expect(context.argv).toEqual(['--foo']);
      expect(context.args).toEqual(expect.objectContaining({ foo: true }));
    });

    it('camel cases arg', () => {
      context.addOption('--foo-bar');

      expect(context.argv).toEqual(['--foo-bar']);
      expect(context.args).toEqual(expect.objectContaining({ 'foo-bar': true, fooBar: true }));
    });

    it('supports single dashed', () => {
      context.addOption('-f');

      expect(context.argv).toEqual(['-f']);
      expect(context.args).toEqual(expect.objectContaining({ f: true }));
    });

    it('supports values', () => {
      context.addOption('--foo', 123);

      expect(context.argv).toEqual(['--foo', '123']);
      expect(context.args).toEqual(expect.objectContaining({ foo: 123 }));
    });

    it('supports values (joins with equals)', () => {
      context.addOption('--foo', 123, true);

      expect(context.argv).toEqual(['--foo=123']);
      expect(context.args).toEqual(expect.objectContaining({ foo: 123 }));
    });

    it('supports equal sign values', () => {
      context.addOption('--foo=123', true);

      expect(context.argv).toEqual(['--foo=123']);
      expect(context.args).toEqual(expect.objectContaining({ foo: '123' }));
    });

    it('supports negated options', () => {
      context.addOption('--no-foo');

      expect(context.argv).toEqual(['--no-foo']);
      expect(context.args).toEqual(expect.objectContaining({ foo: false }));
    });
  });

  describe('addOptions()', () => {
    it('adds multiple options', () => {
      context.addOptions(['--foo', '--bar']);

      expect(context.argv).toEqual(['--foo', '--bar']);
      expect(context.args).toEqual(expect.objectContaining({ foo: true, bar: true }));
    });
  });

  describe('findConfigByName()', () => {
    const configFoo = { driver: 'foo', path: '/some/path/foo.js' };

    it('returns nothing if not found', () => {
      expect(context.findConfigByName('foo.js')).toBeUndefined();
    });

    it('returns path if found', () => {
      context.configPaths.push(configFoo);

      expect(context.findConfigByName('foo.js')).toBe(configFoo);
    });

    it('returns driver name if found', () => {
      context.configPaths.push(configFoo);

      expect(context.findConfigByName('foo')).toBe(configFoo);
    });

    it('only checks file base name', () => {
      context.configPaths.push({ driver: 'foo', path: '/some/path/foo.js/other/file.js' });

      expect(context.findConfigByName('foo.js')).toBeUndefined();
    });
  });

  describe('getArg()', () => {
    it('returns null if arg doesnt exist', () => {
      expect(context.getArg('foo')).toBeNull();
    });

    it('can customize fallback value', () => {
      expect(context.getArg('foo', 123)).toBe(123);
    });

    it('returns value if it exists', () => {
      context.args.foo = 'abc';

      expect(context.getArg('foo', 123)).toBe('abc');
    });
  });
});
