import JestDriver from '../src/JestDriver';
import { createTestTool, EXEC_RESULT } from '../../../tests/helpers';

describe('JestDriver', () => {
  let driver: JestDriver;

  beforeEach(() => {
    driver = new JestDriver();
    driver.tool = createTestTool();
    driver.bootstrap();
  });

  it('sets options from constructor', () => {
    driver = new JestDriver({
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
        bin: 'jest',
        configName: 'jest.config.js',
        configOption: '--config',
        dependencies: ['babel'],
        description: 'Unit test files with Jest',
        filterOptions: true,
        helpOption: '--help',
        title: 'Jest',
        useConfigOption: false,
        watchOptions: [],
      }),
    );
  });

  describe('handleSuccess()', () => {
    it('outputs stderr', () => {
      const spy = jest.spyOn(driver.tool, 'log');

      driver.handleSuccess({
        ...EXEC_RESULT,
        cmd: 'jest',
        stdout: 'Hello',
        stderr: ' Why??? ',
      });

      expect(spy).toHaveBeenCalledWith('Why???');
    });

    it('outputs nothing if empty strings', () => {
      const spy = jest.spyOn(driver.tool, 'log');

      driver.handleSuccess({
        ...EXEC_RESULT,
        cmd: 'jest',
        stdout: '',
        stderr: '',
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it('outputs stdout and stderr when running coverage', () => {
      const spy = jest.spyOn(driver.tool, 'log');

      driver.handleSuccess({
        ...EXEC_RESULT,
        cmd: 'jest --coverage',
        stdout: 'Coverage',
        stderr: 'Tests',
      });

      expect(spy).toHaveBeenCalledWith('Tests');
      expect(spy).toHaveBeenCalledWith('Coverage');
    });

    it('outputs nothing if empty strings when running coverage', () => {
      const spy = jest.spyOn(driver.tool, 'log');

      driver.handleSuccess({
        ...EXEC_RESULT,
        cmd: 'jest --coverage',
        stdout: '',
        stderr: '',
      });

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
