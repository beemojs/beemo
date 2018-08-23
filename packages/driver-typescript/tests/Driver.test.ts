import path from 'path';
import rimraf from 'rimraf';
import TypeScriptDriver from '../src/TypeScriptDriver';
import { createDriverContext, createTestTool } from '../../../tests/helpers';

jest.mock('rimraf');

describe('TypeScriptDriver', () => {
  let driver: TypeScriptDriver;

  beforeEach(() => {
    driver = new TypeScriptDriver();
    driver.tool = createTestTool();
    driver.context = createDriverContext(driver);
    driver.bootstrap();
    driver.config = {
      compilerOptions: {},
    };
  });

  it('sets options from constructor', () => {
    driver = new TypeScriptDriver({
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
      driver.handleCleanTarget(driver, [], createDriverContext(driver));

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no clean param', () => {
      driver.config.compilerOptions = { outDir: './lib' };
      driver.handleCleanTarget(driver, [], createDriverContext(driver));

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      driver.context.args.clean = true;
      driver.config.compilerOptions = {};
      driver.handleCleanTarget(driver, [], driver.context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      driver.context.args.clean = true;
      driver.config.compilerOptions = { outDir: './lib' };
      driver.handleCleanTarget(driver, [], driver.context);

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
