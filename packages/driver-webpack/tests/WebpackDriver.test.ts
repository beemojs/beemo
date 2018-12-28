import WebpackDriver from '../src/WebpackDriver';
import { createTestTool } from '../../../tests/helpers';

describe('WebpackDriver', () => {
  let driver: WebpackDriver;

  beforeEach(() => {
    driver = new WebpackDriver();
    driver.tool = createTestTool();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new WebpackDriver({
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
        bin: 'webpack',
        configName: 'webpack.config.js',
        configOption: '--config',
        dependencies: [],
        description: 'Bundle source files with Webpack',
        filterOptions: false,
        helpOption: '--help',
        title: 'Webpack',
        useConfigOption: false,
      }),
    );
  });
});
