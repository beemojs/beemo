import { mockTool, stubExecResult } from '@beemo/core/test';
import { FlowDriver } from '../src/FlowDriver';

describe('FlowDriver', () => {
	let driver: FlowDriver;

	beforeEach(() => {
		driver = new FlowDriver();
		driver.startup(mockTool());
	});

	it('sets options from constructor', () => {
		driver = new FlowDriver({
			args: ['--foo', '--bar=1'],
			dependencies: ['babel'],
			env: { DEV: 'true' },
		});

		expect(driver.options).toEqual({
			args: ['--foo', '--bar=1'],
			dependencies: ['babel'],
			env: { DEV: 'true' },
			expandGlobs: true,
			strategy: 'native',
			template: '',
		});
	});

	it('sets correct metadata', () => {
		expect(driver.metadata).toEqual(
			expect.objectContaining({
				bin: 'flow',
				configName: '.flowconfig',
				configOption: '--config',
				dependencies: [],
				description: 'Type check files with Flow',
				filterOptions: true,
				helpOption: '--help',
				title: 'Flow',
				useConfigOption: false,
			}),
		);
	});

	describe('formatConfig()', () => {
		describe('[include]', () => {
			it('supports', () => {
				expect(
					driver.formatConfig({
						include: ['./foo.js', './bar'],
					}),
				).toMatchSnapshot();
			});

			it('handles empty', () => {
				expect(
					driver.formatConfig({
						include: [],
					}),
				).toMatchSnapshot();
			});
		});

		describe('[ignore]', () => {
			it('supports', () => {
				expect(
					driver.formatConfig({
						ignore: ['.*/__tests__/.*'],
					}),
				).toMatchSnapshot();
			});

			it('handles empty', () => {
				expect(
					driver.formatConfig({
						ignore: [],
					}),
				).toMatchSnapshot();
			});
		});

		describe('[libs]', () => {
			it('supports', () => {
				expect(
					driver.formatConfig({
						libs: ['./foo.js.flow'],
					}),
				).toMatchSnapshot();
			});

			it('handles empty', () => {
				expect(
					driver.formatConfig({
						libs: [],
					}),
				).toMatchSnapshot();
			});
		});

		describe('[lints]', () => {
			it('supports', () => {
				expect(
					driver.formatConfig({
						lints: {
							all: 'error',
							sketchy_null_bool: 'off',
							untyped_type_import: 'warn',
						},
					}),
				).toMatchSnapshot();
			});

			it('handles values as numbers', () => {
				expect(
					driver.formatConfig({
						lints: {
							all: 2,
							sketchy_null_bool: 0,
							untyped_type_import: 1,
						},
					}),
				).toMatchSnapshot();
			});

			it('supports dashed keys', () => {
				expect(
					driver.formatConfig({
						lints: {
							all: 'error',
							'sketchy-null-bool': 'off',
							'untyped-type-import': 'warn',
						},
					}),
				).toMatchSnapshot();
			});
		});

		describe('[options]', () => {
			it('handles primitives', () => {
				expect(
					driver.formatConfig({
						options: {
							emoji: true,
							'esproposal.class_instance_fields': 'ignore',
							traces: 3,
						},
					}),
				).toMatchSnapshot();
			});

			it('handles arrays', () => {
				expect(
					driver.formatConfig({
						options: {
							'module.file_ext': ['.js', '.jsx'],
						},
					}),
				).toMatchSnapshot();
			});

			it('handles objects', () => {
				expect(
					driver.formatConfig({
						options: {
							'module.name_mapper': {
								'^image![a-zA-Z0-9$_]+$': 'ImageStub',
							},
							'module.name_mapper.extension': {
								css: '<PROJECT_ROOT>/CSSFlowStub.js.flow',
							},
						},
					}),
				).toMatchSnapshot();
			});

			it('handles regex', () => {
				expect(
					driver.formatConfig({
						options: {
							suppress_comment: /(.|\n)*\$FlowFixMe/,
						},
					}),
				).toMatchSnapshot();
			});

			it('handles escaped string', () => {
				expect(
					driver.formatConfig({
						options: {
							suppress_comment: '\\\\(.\\\\|\\n\\\\)*\\\\$FlowFixMe',
						},
					}),
				).toMatchSnapshot();
			});
		});

		describe('[version]', () => {
			it('supports', () => {
				expect(
					driver.formatConfig({
						version: '1.2.3',
					}),
				).toMatchSnapshot();
			});

			it('handles empty', () => {
				expect(
					driver.formatConfig({
						version: '',
					}),
				).toMatchSnapshot();
			});
		});
	});

	describe('processFailure()', () => {
		it('logs stdout on error code 2', () => {
			driver.processFailure(
				stubExecResult({
					exitCode: 2,
					stdout: 'Out',
					stderr: 'Err',
				}),
			);

			expect(driver.output.stderr).toBe('Out');
		});

		it('logs stderr on other error codes', () => {
			driver.processFailure(
				stubExecResult({
					exitCode: 1,
					stdout: 'Out',
					stderr: 'Err',
				}),
			);

			expect(driver.output.stderr).toBe('Err');
		});
	});
});
