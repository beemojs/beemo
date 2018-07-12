import path from 'path';
import rimraf from 'rimraf';
import BabelDriver from '../src/BabelDriver';

jest.mock('rimraf');

describe('BabelDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new BabelDriver();
    driver.tool = {
      on: jest.fn(),
    };
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
      driver.handleCleanTarget(driver, [], {
        args: { outDir: './lib' },
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      driver.handleCleanTarget(driver, [], {
        args: { clean: true },
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      driver.handleCleanTarget(driver, [], {
        args: {
          clean: true,
          outDir: './lib',
        },
      });

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
