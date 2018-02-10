import PrettierDriver from '../src/PrettierDriver';

describe('PrettierDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new PrettierDriver();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new PrettierDriver({
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
      bin: 'prettier',
      configName: '.prettierrc.json',
      configOption: '--config',
      dependencies: [],
      description: 'Format code with Prettier.',
      helpOption: '--help',
      title: 'Prettier',
      useConfigOption: false,
    });
  });
});
