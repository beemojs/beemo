import fs from 'fs';
import { DriverContext, Path } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/test';
import PrettierDriver from '../src/PrettierDriver';

describe('PrettierDriver', () => {
  let driver: PrettierDriver;
  let context: DriverContext;
  let writeSpy: jest.SpyInstance;

  beforeEach(() => {
    driver = new PrettierDriver();
    driver.tool = mockTool();
    driver.bootstrap();

    context = stubDriverContext(driver);

    writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
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

      driver.onCreateConfigFile.emit([context, new Path('/some/path/prettier.config.js'), config]);

      expect(config).toEqual({ semi: true });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.onCreateConfigFile.emit([
          context,
          new Path('/some/path/prettier.config.js'),
          {
            // @ts-expect-error
            ignore: 'foo',
          },
        ]);
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        semi: true,
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.onCreateConfigFile.emit([context, new Path('/some/path/prettier.config.js'), config]);

      expect(writeSpy).toHaveBeenCalledWith('/some/path/.prettierignore', 'foo\nbar\nbaz');

      expect(context.configPaths).toEqual([
        { driver: 'prettier', path: new Path('/some/path/.prettierignore') },
      ]);

      expect(config).toEqual({ semi: true });
    });

    it('emits `onCreateIgnoreFile` event', () => {
      const createSpy = jest.fn((ctx, path, config) => {
        config.ignore.push('qux');
      });

      driver.onCreateIgnoreFile.listen(createSpy);

      const config = {
        semi: true,
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.onCreateConfigFile.emit([context, new Path('/some/path/prettier.config.js'), config]);

      expect(createSpy).toHaveBeenCalledWith(context, new Path('/some/path/.prettierignore'), {
        ignore: ['foo', 'bar', 'baz', 'qux'],
      });

      expect(writeSpy).toHaveBeenCalledWith('/some/path/.prettierignore', 'foo\nbar\nbaz\nqux');
    });
  });
});
