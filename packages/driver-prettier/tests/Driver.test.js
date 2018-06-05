import fs from 'fs';
import PrettierDriver from '../src/PrettierDriver';

jest.mock('fs');

describe('PrettierDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new PrettierDriver();
    driver.context = {
      configPaths: [],
    };
    driver.tool = {
      on: jest.fn(),
    };
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new PrettierDriver({
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
      const config = { foo: 123 };

      driver.handleCreateIgnoreFile('/some/path/prettier.config.js', config);

      expect(config).toEqual({ foo: 123 });
    });

    it('errors if not an array', () => {
      expect(() => {
        driver.handleCreateIgnoreFile('/some/path/prettier.config.js', {
          ignore: 'foo',
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it('creates ignore file and updates references', () => {
      const config = {
        foo: 123,
        ignore: ['foo', 'bar', 'baz'],
      };

      driver.handleCreateIgnoreFile('/some/path/prettier.config.js', config);

      expect(fs.writeFileSync).toHaveBeenCalledWith('/some/path/.prettierignore', 'foo\nbar\nbaz');

      expect(driver.context.configPaths).toEqual(['/some/path/.prettierignore']);

      expect(config).toEqual({ foo: 123 });
    });
  });
});
