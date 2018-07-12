import Context from '../../src/contexts/Context';

describe('Context', () => {
  let context;

  beforeEach(() => {
    context = new Context({ _: [], $0: '' });
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new Context({ _: [], $0: '', foo: true });

      expect(context.args).toEqual({ _: [], $0: '', foo: true });
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
