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
    expect(driver.metadata).toEqual(
      expect.objectContaining({
        bin: 'jest',
        configName: 'jest.config.js',
        configOption: '--config',
        dependencies: ['babel'],
        description: 'Unit test files with Jest',
        filterOptions: true,
        helpOption: '--help',
        title: 'Jest',
        useConfigOption: false,
      }),
    );
  });

  describe('handleSuccess()', () => {
    it('outputs stderr', () => {
      driver.tool = {
        log: jest.fn(),
      };

      driver.handleSuccess({
        cmd: 'jest',
        stdout: 'Hello',
        stderr: ' Why??? ',
      });

      expect(driver.tool.log).toHaveBeenCalledWith('Why???');
    });

    it('outputs nothing if empty strings', () => {
      driver.tool = {
        log: jest.fn(),
      };

      driver.handleSuccess({
        cmd: 'jest',
        stdout: '',
        stderr: '',
      });

      expect(driver.tool.log).not.toHaveBeenCalled();
    });

    it('outputs stdout and stderr when running coverage', () => {
      driver.tool = {
        log: jest.fn(),
      };

      driver.handleSuccess({
        cmd: 'jest --coverage',
        stdout: 'Coverage',
        stderr: 'Tests',
      });

      expect(driver.tool.log).toHaveBeenCalledWith('Tests');
      expect(driver.tool.log).toHaveBeenCalledWith('Coverage');
    });

    it('outputs nothing if empty strings when running coverage', () => {
      driver.tool = {
        log: jest.fn(),
      };

      driver.handleSuccess({
        cmd: 'jest --coverage',
        stdout: '',
        stderr: '',
      });

      expect(driver.tool.log).not.toHaveBeenCalled();
    });
  });
});
