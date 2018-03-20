import path from 'path';
import rimraf from 'rimraf';
import { Event } from 'boost';
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
    expect(driver.metadata).toEqual({
      bin: 'tsc',
      configName: 'tsconfig.json',
      configOption: '',
      dependencies: [],
      description: 'Type check files with TypeScript.',
      filterOptions: true,
      helpOption: '--help',
      title: 'TypeScript',
      useConfigOption: false,
    });
  });

  describe('handleCleanTarget()', () => {
    it('doesnt run if no clean param', () => {
      driver.config = { outDir: './lib' };
      driver.handleCleanTarget(new Event('foo'), driver, [], {
        yargs: {},
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('doesnt run if no outDir param', () => {
      driver.config = {};
      driver.handleCleanTarget(new Event('foo'), driver, [], {
        yargs: { clean: true },
      });

      expect(rimraf.sync).not.toHaveBeenCalled();
    });

    it('runs if both params', () => {
      driver.config = { outDir: './lib' };
      driver.handleCleanTarget(new Event('foo'), driver, [], {
        yargs: { clean: true },
      });

      expect(rimraf.sync).toHaveBeenCalledWith(path.resolve('./lib'));
    });
  });
});
