import path from 'path';
import rimraf from 'rimraf';
import BabelDriver from '../src/BabelDriver';
import { createDriverContext, createTool } from '../../../tests/helpers';

jest.mock('rimraf');

describe('BabelDriver', () => {
  let driver: BabelDriver;

  beforeEach(() => {
    driver = new BabelDriver();
    driver.tool = createTool();
    driver.context = createDriverContext(driver);
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new BabelDriver({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
    });

    expect(driver.options).toEqual({
      args: ['--foo', '--bar=1'],
      copy: false,
      dependencies: ['babel'],
      env: { DEV: 'true' },
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'babel',
        configName: '.babelrc',
        configOption: '--config',
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
      driver.context.args.outDir = './lib';

      driver.handleCleanTarget(driver, [], driver.context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      driver.context.args.clean = true;

      driver.handleCleanTarget(driver, [], driver.context);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      driver.context.args.outDir = './lib';
      driver.context.args.clean = true;

      driver.handleCleanTarget(driver, [], driver.context);

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
