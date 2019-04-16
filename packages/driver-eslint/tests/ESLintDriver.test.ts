import fs from 'fs';
import { DriverContext } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/lib/testUtils';
import ESLintDriver from '../src/ESLintDriver';

describe('ESLintDriver', () => {
  let driver: ESLintDriver;
  let context: DriverContext;
  let writeSpy: jest.SpyInstance;

  beforeEach(() => {
    driver = new ESLintDriver();
    driver.tool = mockTool();
    driver.bootstrap();

    context = stubDriverContext(driver);

    writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it('sets options from constructor', () => {
    driver = new ESLintDriver({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
    });

    expect(driver.options).toEqual({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
      strategy: 'native',
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'eslint',
        configName: '.eslintrc.js',
        configOption: '--config',
        dependencies: [],
        description: 'Lint files with ESLint',
        filterOptions: true,
        helpOption: '--help',
        title: 'ESLint',
        useConfigOption: false,
      }),
    );
  });

  describe('mergeConfig()', () => {
    it('merges using eslint engine', () => {
      expect(
        driver.mergeConfig(
          {
            env: {
              node: true,
            },
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
        env: {
          node: true,
        },
        rules: {
          foo: ['error', 'always'],
        },
      });
    });
  });

  describe('handleCreateIgnoreFile()', () => {
    it('does nothing if no ignore field', () => {
      const config = { parser: 'babel' };

      driver.onCreateConfigFile.emit([context, '/some/path/.eslintrc.js', config]);

      expect(config).toEqual({ parser: 'babel' });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.onCreateConfigFile.emit([
          context,
          '/some/path/.eslintrc.js',
          {
            // @ts-ignore
            ignore: 'foo',
          },
        ]);
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        parser: 'babel',
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.onCreateConfigFile.emit([context, '/some/path/.eslintrc.js', config]);

      expect(writeSpy).toHaveBeenCalledWith('/some/path/.eslintignore', 'foo\nbar\nbaz');

      expect(context.configPaths).toEqual([{ driver: 'eslint', path: '/some/path/.eslintignore' }]);

      expect(config).toEqual({ parser: 'babel' });
    });

    it('emits `onCreateIgnoreFile` event', () => {
      const createSpy = jest.fn((ctx, path, config) => {
        config.ignore.push('qux');
      });

      driver.onCreateIgnoreFile.listen(createSpy);

      const config = {
        parser: 'babel',
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.onCreateConfigFile.emit([context, '/some/path/.eslintrc.js', config]);

      expect(createSpy).toHaveBeenCalledWith(context, '/some/path/.eslintignore', {
        ignore: ['foo', 'bar', 'baz', 'qux'],
      });

      expect(writeSpy).toHaveBeenCalledWith('/some/path/.eslintignore', 'foo\nbar\nbaz\nqux');
    });
  });
});
