import { Path } from '@boost/common';
import { Context } from '../../src/contexts/Context';
import { stubArgs } from '../../src/test';

describe('Context', () => {
	let context: Context<{ foo: string; baz: boolean }>;

	beforeEach(() => {
		context = new Context(stubArgs({ foo: '', baz: false }));
	});

	describe('constructor()', () => {
		it('sets args', () => {
			const ctx = new Context(stubArgs({ concurrency: 3 }));

			expect(ctx.args).toEqual(stubArgs({ concurrency: 3 }));
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
			expect(context.args.options).toEqual({ baz: false, foo: true });
		});

		it('supports values', () => {
			context.addOption('--foo', 123);

			expect(context.argv).toEqual(['--foo', '123']);
			expect(context.args.options).toEqual({ baz: false, foo: 123 });
		});

		it('supports values (joins with equals)', () => {
			context.addOption('--foo', 123, true);

			expect(context.argv).toEqual(['--foo=123']);
			expect(context.args.options).toEqual({ baz: false, foo: 123 });
		});

		it('supports equal sign values', () => {
			context.addOption('--foo=123', true);

			expect(context.argv).toEqual(['--foo=123']);
			expect(context.args.options).toEqual({ baz: false, foo: '123' });
		});

		it('supports negated options', () => {
			context.addOption('--no-foo');

			expect(context.argv).toEqual(['--no-foo']);
			expect(context.args.options).toEqual({ baz: false, foo: false });
		});

		describe('unknown', () => {
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
		});
	});

	describe('addOptions()', () => {
		it('adds multiple options', () => {
			context.addOptions(['--foo', '--bar']);

			expect(context.argv).toEqual(['--foo', '--bar']);
			expect(context.args.options).toEqual({ baz: false, foo: true });
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
			// @ts-expect-error Allow invalid name
			expect(context.getOption('bar')).toBeNull();
		});

		it('returns value if it exists', () => {
			context.args.options.foo = 'abc';

			expect(context.getOption('foo')).toBe('abc');
		});

		it('returns empty string', () => {
			context.args.options.foo = '';

			expect(context.getOption('foo')).toBe('');
		});

		it('returns false', () => {
			context.args.options.baz = false;

			expect(context.getOption('baz')).toBe(false);
		});
	});

	describe('getRiskyOption()', () => {
		it('returns null if arg doesnt exist', () => {
			expect(context.getRiskyOption('bar')).toBeNull();
		});

		it('returns configured option if it exists', () => {
			// @ts-expect-error Allow
			context.args.options.bar = 'abc';

			expect(context.getRiskyOption('bar')).toBe('abc');
		});

		it('returns unknown option if it exists', () => {
			context.args.unknown.bar = 'xyz';

			expect(context.getRiskyOption('bar')).toBe('xyz');
		});

		it('returns unknown option with an empty string value as true', () => {
			context.args.unknown.bar = '';

			expect(context.getRiskyOption('bar')).toBe(true);
		});

		it('returns unknown option with an empty string value as is when raw', () => {
			context.args.unknown.bar = '';

			expect(context.getRiskyOption('bar', true)).toBe('');
		});

		it('doesnt convert emptry strings to true for known options', () => {
			// @ts-expect-error Allow
			context.args.options.bar = '';

			expect(context.getRiskyOption('bar')).toBe('');
		});
	});
});
