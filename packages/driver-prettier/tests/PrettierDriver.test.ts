import fs from 'fs';
import { DriverContext } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/lib/testUtils';
import PrettierDriver from '../src/PrettierDriver';

describe('PrettierDriver', () => {
  let driver: PrettierDriver;
  let context: DriverContext;
  let spy: jest.SpyInstance;

  beforeEach(() => {
    driver = new PrettierDriver();
    driver.tool = mockTool();
    driver.bootstrap();

    context = stubDriverContext(driver);

    spy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
  });

  afterEach(() => {
    spy.mockRestore();
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

      driver.handleCreateIgnoreFile(context, '/some/path/prettier.config.js', config);

      expect(config).toEqual({ semi: true });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.handleCreateIgnoreFile(context, '/some/path/prettier.config.js', {
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

      driver.handleCreateIgnoreFile(context, '/some/path/prettier.config.js', config);

      expect(spy).toHaveBeenCalledWith('/some/path/.prettierignore', 'foo\nbar\nbaz');

      expect(context.configPaths).toEqual([
        { driver: 'prettier', path: '/some/path/.prettierignore' },
      ]);

      expect(config).toEqual({ semi: true });
    });
  });
});
