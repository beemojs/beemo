import path from 'path';
import rimraf from 'rimraf';
import DriverContext from '../../core/src/contexts/DriverContext';
import BabelDriver from '../src/BabelDriver';
import { createDriverContext, createTestTool } from '../../../tests/helpers';

jest.mock('rimraf');

describe('BabelDriver', () => {
  let driver: BabelDriver;
  let context: DriverContext;

  beforeEach(() => {
    driver = new BabelDriver();
    driver.tool = createTestTool();
    driver.bootstrap();

    context = createDriverContext(driver);
  });

  it('sets options from constructor', () => {
    driver = new BabelDriver({
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
        bin: 'babel',
        configName: 'babel.config.js',
        configOption: '--config-file',
        dependencies: [],
        description: 'Transpile files with Babel',
        filterOptions: false,
        helpOption: '--help',
        title: 'Babel',
        useConfigOption: false,
      }),
    );
  });

  describe('handleCleanTarget()', () => {
    it('doesnt run if no clean param', () => {
      context.args.outDir = './lib';

      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      context.args.clean = true;

      driver.handleCleanTarget(context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      context.args.outDir = './lib';
      context.args.clean = true;

      driver.handleCleanTarget(context);

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
