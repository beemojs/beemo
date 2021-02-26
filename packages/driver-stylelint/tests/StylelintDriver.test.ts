import fs from 'fs';
import { DriverContext, Path } from '@beemo/core';
import { mockTool, stubDriverContext, stubExecResult } from '@beemo/core/test';
import StylelintDriver from '../src/StylelintDriver';

describe('StylelintDriver', () => {
  let driver: StylelintDriver;
  let context: DriverContext;
  let writeSpy: jest.SpyInstance;

  beforeEach(() => {
    driver = new StylelintDriver();
    driver.tool = mockTool();
    driver.bootstrap();

    context = stubDriverContext(driver);

    writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it('sets options from constructor', () => {
    driver = new StylelintDriver({
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
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'stylelint',
        configName: '.stylelintrc.js',
        configOption: '--config',
        dependencies: [],
        description: 'Lint styles with stylelint',
        filterOptions: true,
        helpOption: '--help',
        title: 'stylelint',
        useConfigOption: false,
      }),
    );
  });

  describe('mergeConfig()', () => {
    it('merges arrays by unique value', () => {
      expect(
        driver.mergeConfig(
          {
            extends: 'abc',
            rules: {
              foo: 'error',
            },
          },
          {
            rules: {
              foo: ['error', 'always'],
            },
          },
        ),
      ).toEqual({
        extends: 'abc',
        rules: {
          foo: ['error', 'always'],
        },
      });
    });

    it('merges ignore list correctly', () => {
      expect(
        driver.mergeConfig(
          {
            ignore: ['foo', 'bar'],
          },
          {
            ignore: ['baz', 'foo'],
          },
        ),
      ).toEqual({
        ignore: ['foo', 'bar', 'baz'],
      });
    });
  });

  describe('processFailure()', () => {
    it('outputs stderr and stdout', () => {
      driver.processFailure(
        stubExecResult({
          command: 'stylelint',
          stderr: 'Error',
        }),
      );

      expect(driver.output.stderr).toBe('Error');
    });
  });

  describe('handleCreateIgnoreFile()', () => {
    it('does nothing if no ignore field', () => {
      const config = { extends: 'abc' };

      driver.onCreateConfigFile.emit([context, new Path('/some/path/.stylelintrc.js'), config]);

      expect(config).toEqual({ extends: 'abc' });
    });

    it('errors if not an array or string', () => {
      expect(() => {
        driver.onCreateConfigFile.emit([
          context,
          new Path('/some/path/.stylelintrc.js'),
          {
            // @ts-expect-error
            ignore: 'abc',
          },
        ]);
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        extends: 'abc',
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.onCreateConfigFile.emit([context, new Path('/some/path/.stylelintrc.js'), config]);

      expect(writeSpy).toHaveBeenCalledWith('/some/path/.stylelintignore', 'foo\nbar\nbaz');

      expect(context.configPaths).toEqual([
        { driver: 'stylelint', path: new Path('/some/path/.stylelintignore') },
      ]);

      expect(config).toEqual({ extends: 'abc' });
    });

    it('emits `onCreateIgnoreFile` event', () => {
      const createSpy = jest.fn((ctx, path, config) => {
        config.ignore.push('qux');
      });

      driver.onCreateIgnoreFile.listen(createSpy);

      const config = {
        extends: 'abc',
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.onCreateConfigFile.emit([context, new Path('/some/path/.stylelintrc.js'), config]);

      expect(createSpy).toHaveBeenCalledWith(context, new Path('/some/path/.stylelintignore'), {
        ignore: ['foo', 'bar', 'baz', 'qux'],
      });

      expect(writeSpy).toHaveBeenCalledWith('/some/path/.stylelintignore', 'foo\nbar\nbaz\nqux');
    });
  });
});
