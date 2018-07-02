import Context from '../../src/contexts/Context';

describe('Context', () => {
  let context;

  beforeEach(() => {
    context = new Context({ _: [], $: '' });
  });

  describe('constructor()', () => {
    it('sets args', () => {
      context = new Context({ foo: true });

      expect(context.args).toEqual({ foo: true });
    });
  });

  describe('addArg()', () => {
    it('adds to argv', () => {
      context.addArg('--foo');

      expect(context.argv).toEqual(['--foo']);
    });

    it('adds to args', () => {
      context.addArg('--foo');

      expect(context.args.foo).toBe(true);
    });

    it('camel cases arg', () => {
      context.addArg('--foo-bar');

      expect(context.args['foo-bar']).toBe(true);
      expect(context.args.fooBar).toBe(true);
    });

    it('supports single dashed', () => {
      context.addArg('-f');

      expect(context.args.f).toBe(true);
    });

    it('supports with values', () => {
      context.addArg('--foo=123', true);

      expect(context.argv).toEqual(['--foo=123']);
      expect(context.args.foo).toBe('123');
    });

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
