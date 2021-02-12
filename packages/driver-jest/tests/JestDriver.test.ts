import { mockTool, stubExecResult } from '@beemo/core/lib/testing';
import JestDriver from '../src/JestDriver';

describe('JestDriver', () => {
  let driver: JestDriver;

  beforeEach(() => {
    driver = new JestDriver();
    driver.tool = mockTool();
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
        dependencies: [],
        description: 'Unit test files with Jest',
        filterOptions: true,
        helpOption: '--help',
        title: 'Jest',
        useConfigOption: false,
        watchOptions: ['--watch', '--watchAll'],
      }),
    );
  });

  describe('processSuccess()', () => {
    it('outputs stderr', () => {
      driver.processSuccess(
        stubExecResult({
          command: 'jest',
          stdout: 'Hello',
          stderr: ' Why??? ',
        }),
      );

      expect(driver.output.stdout).toBe('Why???');
    });

    it('outputs nothing if empty strings', () => {
      driver.processSuccess(
        stubExecResult({
          command: 'jest',
          stdout: '',
          stderr: '',
        }),
      );

      expect(driver.output.stdout).toBe('');
    });

    it('outputs stdout and stderr when running coverage', () => {
      driver.processSuccess(
        stubExecResult({
          command: 'jest --coverage',
          stdout: 'Coverage',
          stderr: 'Tests',
        }),
      );

      expect(driver.output.stdout).toBe('Tests\nCoverage');
    });

    it('outputs nothing if empty strings when running coverage', () => {
      driver.processSuccess(
        stubExecResult({
          command: 'jest --coverage',
          stdout: '',
          stderr: '',
        }),
      );

      expect(driver.output.stderr).toBe('');
      expect(driver.output.stdout).toBe('');
    });
  });
});
