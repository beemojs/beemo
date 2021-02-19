import { mockTool } from '@beemo/core/test';
import RollupDriver from '../src/RollupDriver';

describe('RollupDriver', () => {
  let driver: RollupDriver;

  beforeEach(() => {
    driver = new RollupDriver();
    driver.tool = mockTool();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new RollupDriver({
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
        bin: 'rollup',
        configName: 'rollup.config.js',
        configOption: '--config',
        dependencies: [],
        description: 'Bundle source files with Rollup',
        filterOptions: true,
        helpOption: '--help',
        title: 'Rollup',
        useConfigOption: false,
      }),
    );
  });
});
