import path from 'path';
import rimraf from 'rimraf';
import DriverContext from '../../core/src/contexts/DriverContext';
import TypeScriptDriver from '../src/TypeScriptDriver';
import { createDriverContext, createTestTool } from '../../../tests/helpers';

jest.mock('rimraf');

describe('TypeScriptDriver', () => {
  let driver: TypeScriptDriver;
  let context: DriverContext;

  beforeEach(() => {
    driver = new TypeScriptDriver();
    driver.tool = createTestTool();
    driver.bootstrap();
    driver.config = {
      compilerOptions: {},
    };

    context = createDriverContext(driver);
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
        helpOption: '--help --all',
        title: 'TypeScript',
        useConfigOption: false,
        workspaceStrategy: 'copy',
      }),
    );
  });

  describe('handleCleanTarget()', () => {
    it('doesnt run if no config', () => {
      driver.config = {};
      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no clean param', () => {
      driver.config.compilerOptions = { outDir: './lib' };
      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      context.args.clean = true;
      driver.config.compilerOptions = {};
      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      context.args.clean = true;
      driver.config.compilerOptions = { outDir: './lib' };
      driver.handleCleanTarget(context);

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
