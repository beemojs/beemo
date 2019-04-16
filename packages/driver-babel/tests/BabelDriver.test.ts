import path from 'path';
import rimraf from 'rimraf';
import { DriverContext } from '@beemo/core';
import { mockTool, stubDriverContext } from '@beemo/core/lib/testUtils';
import BabelDriver from '../src/BabelDriver';

jest.mock('rimraf');

describe('BabelDriver', () => {
  let driver: BabelDriver;
  let context: DriverContext;

  beforeEach(() => {
    driver = new BabelDriver();
    driver.tool = mockTool();
    driver.bootstrap();

    context = stubDriverContext(driver);
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

      driver.onBeforeExecute.emit([context, []]);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      context.args.clean = true;

      driver.onBeforeExecute.emit([context, []]);

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      context.args.outDir = './lib';
      context.args.clean = true;

      driver.onBeforeExecute.emit([context, []]);

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
