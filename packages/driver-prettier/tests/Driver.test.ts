import fs from 'fs';
import PrettierDriver from '../src/PrettierDriver';
import { createDriverContext, createTestTool } from '../../../tests/helpers';

jest.mock('fs');

describe('PrettierDriver', () => {
  let driver: PrettierDriver;

  beforeEach(() => {
    driver = new PrettierDriver();
    driver.tool = createTestTool();
    driver.context = createDriverContext(driver);
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new PrettierDriver({
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
        bin: 'prettier',
        configName: 'prettier.config.js',
        configOption: '--config',
        dependencies: [],
        description: 'Format code with Prettier',
        filterOptions: true,
        helpOption: '--help',
        title: 'Prettier',
        useConfigOption: false,
      }),
    );
  });

  describe('handleCreateIgnoreFile()', () => {
    it('does nothing if no ignore field', () => {
      const config = { semi: true };

      driver.handleCreateIgnoreFile('/some/path/prettier.config.js', config);

      expect(config).toEqual({ semi: true });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.handleCreateIgnoreFile('/some/path/prettier.config.js', {
          // @ts-ignore
          ignore: 'foo',
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        semi: true,
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.handleCreateIgnoreFile('/some/path/prettier.config.js', config);

      expect(fs.writeFileSync).toHaveBeenCalledWith('/some/path/.prettierignore', 'foo\nbar\nbaz');

      expect(driver.context.configPaths).toEqual([
        { driver: 'prettier', path: '/some/path/.prettierignore' },
      ]);

      expect(config).toEqual({ semi: true });
    });
  });
});
