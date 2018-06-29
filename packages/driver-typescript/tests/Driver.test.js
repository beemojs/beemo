import path from 'path';
import rimraf from 'rimraf';
import TypeScriptDriver from '../src/TypeScriptDriver';

jest.mock('rimraf');

describe('TypeScriptDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new TypeScriptDriver();
    driver.tool = {
      on: jest.fn(),
    };
    driver.bootstrap();
    driver.config = {
      compilerOptions: {},
    };
  });

  it('sets options from constructor', () => {
    driver = new TypeScriptDriver({
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
        bin: 'tsc',
        configName: 'tsconfig.json',
        configOption: '',
        dependencies: [],
        description: 'Type check files with TypeScript',
        filterOptions: true,
        helpOption: '--help',
        title: 'TypeScript',
        useConfigOption: false,
        workspaceStrategy: 'copy',
      }),
    );
  });

  describe('handleCleanTarget()', () => {
    it('doesnt run if no config', () => {
      driver.config = {};
      driver.handleCleanTarget(driver, [], {
        args: {},
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no clean param', () => {
      driver.config.compilerOptions = { outDir: './lib' };
      driver.handleCleanTarget(driver, [], {
        args: {},
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      driver.config.compilerOptions = {};
      driver.handleCleanTarget(driver, [], {
        args: { clean: true },
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      driver.config.compilerOptions = { outDir: './lib' };
      driver.handleCleanTarget(driver, [], {
        args: { clean: true },
      });

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
