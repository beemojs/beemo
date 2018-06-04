/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

import { Driver, Execution } from '@beemo/core';
import { JestConfig } from './types';

// Success: Writes passed tests to stderr (Bug? https://github.com/facebook/jest/issues/5064)
// Success: Writes coverage to stdout
// Failure: Writes failed tests to stderr
export default class JestDriver extends Driver<JestConfig> {
  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      configName: 'jest.config.js',
      dependencies: ['babel'],
      description: 'Unit test files with Jest',
      filterOptions: true,
      title: 'Jest',
    });
  }

  // https://github.com/nodejs/node/issues/19218
  getSupportedOptions(): string[] {
    return [
      '--all',
      '--automock',
      '-b',
      '--bail',
      '--browser',
      '-c',
      '--cache',
      '--cacheDirectory',
      '--changedFilesWithAncestor',
      '--changedSince',
      '--ci',
      '--clearCache',
      '--clearMocks',
      '--collectCoverage',
      '--collectCoverageFrom',
      '--collectCoverageOnlyFrom',
      '--color',
      '--colors',
      '--config',
      '--coverage',
      '--coverageDirectory',
      '--coveragePathIgnorePatterns',
      '--coverageReporters',
      '--coverageThreshold',
      '--debug',
      '--detectLeaks',
      '--detectOpenHandles',
      '-e',
      '--env',
      '--errorOnDeprecated',
      '--expand',
      '-f',
      '--filter',
      '--findRelatedTests',
      '--forceExit',
      '--globalSetup',
      '--globalTeardown',
      '--globals',
      '--haste',
      '-h',
      '--help',
      '-i',
      '--json',
      '--lastCommit',
      '--listTests',
      '--logHeapUsage',
      '--mapCoverage',
      '--maxWorkers',
      '--moduleDirectories',
      '--moduleFileExtensions',
      '--moduleNameMapper',
      '--modulePathIgnorePatterns',
      '--modulePaths',
      '--no-cache',
      '--no-watchman',
      '--noStackTrace',
      '--notify',
      '--notifyMode',
      '-o',
      '--onlyChanged',
      '--onlyFailures',
      '--outputFile',
      '--passWithNoTests',
      '--preset',
      '--projects',
      '--reporters',
      '--resetMocks',
      '--resetModules',
      '--resolver',
      '--restoreMocks',
      '--rootDir',
      '--roots',
      '--runInBand',
      '--runTestsByPath',
      '--setupFiles',
      '--setupTestFrameworkScriptFile',
      '--showConfig',
      '--silent',
      '--skipFilter',
      '--snapshotSerializers',
      '-t',
      '--testEnvironment',
      '--testEnvironmentOptions',
      '--testFailureExitCode',
      '--testLocationInResults',
      '--testMatch',
      '--testNamePattern',
      '--testPathIgnorePatterns',
      '--testPathPattern',
      '--testRegex',
      '--testResultsProcessor',
      '--testRunner',
      '--testURL',
      '--timers',
      '--transform',
      '--transformIgnorePatterns',
      '-u',
      '--unmockedModulePathPatterns',
      '--updateSnapshot',
      '--useStderr',
      '-v',
      '--verbose',
      '--version',
      '-w',
      '--watch',
      '--watchAll',
      '--watchPathIgnorePatterns',
      '--watchman',
    ];
  }

  handleSuccess(response: Execution) {
    const out = response.stdout.trim();
    const err = response.stderr.trim();

    if (response.cmd.includes('--coverage')) {
      if (err) {
        this.tool.log(err);
      }

      if (out) {
        this.tool.log(out);
      }
    } else if (err) {
      this.tool.log(err);
    }
  }
}
