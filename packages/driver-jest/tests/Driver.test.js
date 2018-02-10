import JestDriver from '../src/JestDriver';

describe('JestDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new JestDriver();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new JestDriver({
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
      bin: 'jest',
      configName: 'jest.json',
      configOption: '--config',
      dependencies: ['babel'],
      description: 'Unit test files with Jest.',
      helpOption: '--help',
      title: 'Jest',
      useConfigOption: false,
    });
  });
});
