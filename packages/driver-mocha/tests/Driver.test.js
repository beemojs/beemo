import MochaDriver from '../src/MochaDriver';

describe('MochaDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new MochaDriver();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new MochaDriver({
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
      bin: 'mocha',
      configName: 'mocha.opts',
      configOption: '--opts',
      dependencies: [],
      description: 'Unit test files with Mocha',
      filterOptions: false,
      helpOption: '--help',
      title: 'Mocha',
      useConfigOption: true,
    });
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
