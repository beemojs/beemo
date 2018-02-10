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
      description: 'Unit test files with Mocha.',
      helpOption: '--help',
      title: 'Mocha',
      useConfigOption: true,
    });
  });

  describe('formatFile()', () => {
    it('supports primitives', () => {
      expect(
        driver.formatFile({
          bar: 'abc',
          baz: true,
          foo: 123,
        }),
      ).toMatchSnapshot();
    });

    it('supports arrays', () => {
      expect(
        driver.formatFile({
          ext: ['js', 'jsx'],
        }),
      ).toMatchSnapshot();
    });

    it('handles reporter options', () => {
      expect(
        driver.formatFile({
          reporterOptions: {
            abc: '123',
            def: '456',
          },
        }),
      ).toMatchSnapshot();
    });

    it('handles always underscored options', () => {
      expect(
        driver.formatFile({
          es_staging: true,
          use_strict: true,
        }),
      ).toMatchSnapshot();
    });
  });
});
