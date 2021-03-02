import { mockTool } from '@beemo/core/test';
import MochaDriver from '../src/MochaDriver';

describe('MochaDriver', () => {
  let driver: MochaDriver;

  beforeEach(() => {
    driver = new MochaDriver();
    driver.tool = mockTool();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new MochaDriver({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
    });

    expect(driver.options).toEqual({
      args: ['--foo', '--bar=1'],
      dependencies: ['babel'],
      env: { DEV: 'true' },
      expandGlobs: true,
      strategy: 'native',
      template: '',
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'mocha',
        configName: '.mocharc.js',
        configOption: '--config',
        dependencies: [],
        description: 'Unit test files with Mocha',
        filterOptions: true,
        helpOption: '--help',
        title: 'Mocha',
        useConfigOption: true,
      }),
    );
  });
});
