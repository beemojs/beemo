import MochaDriver from '../src/MochaDriver';
import { createTestTool } from '../../../tests/helpers';

describe('MochaDriver', () => {
  let driver: MochaDriver;

  beforeEach(() => {
    driver = new MochaDriver();
    driver.tool = createTestTool();
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
      strategy: 'native',
    });
  });

  it('sets correct metadata', () => {
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'mocha',
        configName: 'mocha.opts',
        configOption: '--opts',
        dependencies: [],
        description: 'Unit test files with Mocha',
        filterOptions: false,
        helpOption: '--help',
        title: 'Mocha',
        useConfigOption: true,
      }),
    );
  });

  describe('formatConfig()', () => {
    it('supports primitives', () => {
      expect(
        driver.formatConfig({
          bar: 'abc',
          baz: true,
          foo: 123,
        }),
      ).toMatchSnapshot();
    });

    it('supports arrays', () => {
      expect(
        driver.formatConfig({
          ext: ['js', 'jsx'],
        }),
      ).toMatchSnapshot();
    });

    it('supports arrays with a comma', () => {
      expect(
        driver.formatConfig({
          globals: ['foo', 'bar'],
        }),
      ).toMatchSnapshot();
    });

    it('handles reporter options', () => {
      expect(
        driver.formatConfig({
          reporterOptions: {
            abc: '123',
            def: '456',
          },
        }),
      ).toMatchSnapshot();
    });

    it('handles always underscored options', () => {
      expect(
        driver.formatConfig({
          es_staging: true,
          use_strict: true,
        }),
      ).toMatchSnapshot();
    });
  });
});
