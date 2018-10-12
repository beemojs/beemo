import fs from 'fs';
import ESLintDriver from '../src/ESLintDriver';
import { createDriverContext, createTestTool } from '../../../tests/helpers';

jest.mock('fs');

describe('ESLintDriver', () => {
  let driver: ESLintDriver;

  beforeEach(() => {
    driver = new ESLintDriver();
    driver.tool = createTestTool();
    driver.context = createDriverContext(driver);
    driver.bootstrap();
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

      driver.handleCreateIgnoreFile('/some/path/.eslintrc.js', config);

      expect(config).toEqual({ parser: 'babel' });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.handleCreateIgnoreFile('/some/path/.eslintrc.js', {
          // @ts-ignore
          ignore: 'foo',
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        parser: 'babel',
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.handleCreateIgnoreFile('/some/path/.eslintrc.js', config);

      expect(fs.writeFileSync).toHaveBeenCalledWith('/some/path/.eslintignore', 'foo\nbar\nbaz');

      expect(driver.context.configPaths).toEqual([
        { driver: 'eslint', path: '/some/path/.eslintignore' },
      ]);

      expect(config).toEqual({ parser: 'babel' });
    });
  });
});
