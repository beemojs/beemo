import { Path } from '@boost/common';
import Context from '../../src/contexts/Context';
import { stubArgs } from '../../src/testing';

describe('Context', () => {
  let context: Context<{ foo: string }>;

  beforeEach(() => {
    context = new Context(stubArgs({ foo: '' }));
  });

  describe('constructor()', () => {
    it('sets args', () => {
      const ctx = new Context(stubArgs({ stdio: 'pipe' }));

      expect(ctx.args).toEqual(stubArgs({ stdio: 'pipe' }));
    });
  });

  describe('addConfigPath()', () => {
    it('adds a config by name', () => {
      expect(context.configPaths).toEqual([]);

      context.addConfigPath('babel', new Path('./babel.config.js'));

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: new Path('./babel.config.js') },
      ]);
    });
  });

  describe('addOption()', () => {
    it('adds to argv and args', () => {
      context.addOption('--foo');

      expect(context.argv).toEqual(['--foo']);
      expect(context.args.options).toEqual({ foo: true });
    });

    it('camel cases arg', () => {
      context.addOption('--foo-bar');

      expect(context.argv).toEqual(['--foo-bar']);
      expect(context.args.unknown).toEqual({ fooBar: 'true' });
    });

    it('supports single dashed', () => {
      context.addOption('-f');

      expect(context.argv).toEqual(['-f']);
      expect(context.args.unknown).toEqual({ f: 'true' });
    });

    it('supports values', () => {
      context.addOption('--foo', 123);

      expect(context.argv).toEqual(['--foo', '123']);
      expect(context.args.options).toEqual({ foo: 123 });
    });

    it('supports values (joins with equals)', () => {
      context.addOption('--foo', 123, true);

      expect(context.argv).toEqual(['--foo=123']);
      expect(context.args.options).toEqual({ foo: 123 });
    });

    it('supports equal sign values', () => {
      context.addOption('--foo=123', true);

      expect(context.argv).toEqual(['--foo=123']);
      expect(context.args.options).toEqual({ foo: '123' });
    });

    it('supports negated options', () => {
      context.addOption('--no-foo');

      expect(context.argv).toEqual(['--no-foo']);
      expect(context.args.options).toEqual({ foo: false });
    });
  });

  describe('addOptions()', () => {
    it('adds multiple options', () => {
      context.addOptions(['--foo', '--bar']);

      expect(context.argv).toEqual(['--foo', '--bar']);
      expect(context.args.options).toEqual({ foo: true });
      expect(context.args.unknown).toEqual({ bar: 'true' });
    });
  });

  describe('findConfigByName()', () => {
    const configFoo = { driver: 'foo', path: new Path('/some/path/foo.js') };

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
      context.configPaths.push({
        driver: 'foo',
        path: new Path('/some/path/foo.js/other/file.js'),
      });

      expect(context.findConfigByName('foo.js')).toBeUndefined();
    });
  });

  describe('addParam()', () => {
    it('can add positional args', () => {
      context.addParam('./foo');

      expect(context.argv).toEqual(['./foo']);
      expect(context.args.params).toEqual(['./foo']);
    });
  });

  describe('addParams()', () => {
    it('adds multiple arguments', () => {
      context.addParams(['./foo', './bar']);

      expect(context.args.params).toEqual(['./foo', './bar']);
    });
  });

  describe('getOption()', () => {
    it('returns null if arg doesnt exist', () => {
      expect(context.getOption('foo')).toBeNull();
    });

    it('can customize fallback value', () => {
      expect(context.getOption('foo', '123')).toBe('123');
    });

    it('returns value if it exists', () => {
      context.args.options.foo = 'abc';

      expect(context.getOption('foo', '123')).toBe('abc');
    });
  });

  describe('getRiskyOption()', () => {
    it('returns null if arg doesnt exist', () => {
      expect(context.getRiskyOption('bar')).toBeNull();
    });

    it('returns configured option if it exists', () => {
      // @ts-ignore Allow
      context.args.options.bar = 'abc';

      expect(context.getRiskyOption('bar')).toBe('abc');
    });

    it('returns unknown option if it exists', () => {
      context.args.unknown.bar = 'xyz';

      expect(context.getRiskyOption('bar')).toBe('xyz');
    });
  });
});
