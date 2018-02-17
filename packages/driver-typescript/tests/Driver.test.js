import TypeScriptDriver from '../src/TypeScriptDriver';

describe('TypeScriptDriver', () => {
  let driver;

  beforeEach(() => {
    driver = new TypeScriptDriver();
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
      helpOption: '--help',
      title: 'TypeScript',
      useConfigOption: false,
    });
  });
});
