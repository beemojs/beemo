import fs from 'fs';
import { Event } from 'boost';
import FlowDriver from '../src/FlowDriver';

describe('FlowDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new FlowDriver();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new FlowDriver({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: true },
    });

    expect(driver.options).toEqual({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: true },
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual({
      bin: 'flow',
      configName: '.flowconfig',
      configOption: '--config',
      dependencies: [],
      description: 'Type check files with Flow.',
      helpOption: '--help',
      title: 'Flow',
      useConfigOption: false,
    });
  });

  describe('formatFile()', () => {
    describe('[include]', () => {
      it('supports', () => {
        expect(driver.formatFile({
          include: ['./foo.js', './bar'],
        })).toMatchSnapshot();
      });

      it('handles empty', () => {
        expect(driver.formatFile({
          include: [],
        })).toMatchSnapshot();
      });
    });

    describe('[ignore]', () => {
      it('supports', () => {
        expect(driver.formatFile({
          ignore: ['.*/__tests__/.*'],
        })).toMatchSnapshot();
      });

      it('handles empty', () => {
        expect(driver.formatFile({
          ignore: [],
        })).toMatchSnapshot();
      });
    });

    describe('[libs]', () => {
      it('supports', () => {
        expect(driver.formatFile({
          libs: ['./foo.js.flow'],
        })).toMatchSnapshot();
      });

      it('handles empty', () => {
        expect(driver.formatFile({
          libs: [],
        })).toMatchSnapshot();
      });
    });

    describe('[lints]', () => {
      it('supports', () => {
        expect(driver.formatFile({
          lints: {
            all: 'error',
            untyped_type_import: 'warn',
            sketchy_null_bool: 'off',
          },
        })).toMatchSnapshot();
      });

      it('handles values as numbers', () => {
        expect(driver.formatFile({
          lints: {
            all: 2,
            untyped_type_import: 1,
            sketchy_null_bool: 0,
          },
        })).toMatchSnapshot();
      });

      it('supports dashed keys', () => {
        expect(driver.formatFile({
          lints: {
            all: 'error',
            'untyped-type-import': 'warn',
            'sketchy-null-bool': 'off',
          },
        })).toMatchSnapshot();
      });
    });

    describe('[options]', () => {
      it('handles primitives', () => {
        expect(driver.formatFile({
          options: {
            emoji: true,
            'esproposal.class_instance_fields': 'ignore',
            traces: 3,
          },
        })).toMatchSnapshot();
      });

      it('handles arrays', () => {
        expect(driver.formatFile({
          options: {
            'module.file_ext': ['.js', '.jsx'],
          },
        })).toMatchSnapshot();
      });

      it('handles objects', () => {
        expect(driver.formatFile({
          options: {
            'module.name_mapper': {
              '^image![a-zA-Z0-9$_]+$': 'ImageStub',
            },
            'module.name_mapper.extension': {
              css: '<PROJECT_ROOT>/CSSFlowStub.js.flow',
            },
          },
        })).toMatchSnapshot();
      });

      it('handles regex', () => {
        expect(driver.formatFile({
          options: {
            suppress_comment: /(.|\n)*\$FlowFixMe/,
          },
        })).toMatchSnapshot();
      });

      it('handles escaped string', () => {
        expect(driver.formatFile({
          options: {
            suppress_comment: '\\\\(.\\\\|\\n\\\\)*\\\\$FlowFixMe',
          },
        })).toMatchSnapshot();
      });
    });

    describe('[version]', () => {
      it('supports', () => {
        expect(driver.formatFile({
          version: '1.2.3',
        })).toMatchSnapshot();
      });

      it('handles empty', () => {
        expect(driver.formatFile({
          version: '',
        })).toMatchSnapshot();
      });
    });
  });
});
