/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import { Driver } from '@beemo/core';

import type { Execution } from '@beemo/core';

// Success: Writes passed tests to stderr (Bug? https://github.com/facebook/jest/issues/5064)
// Success: Writes coverage to stdout
// Failure: Writes failed tests to stderr
export default class JestDriver extends Driver {
  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      configName: 'jest.json',
      dependencies: ['babel'],
      description: 'Unit test files with Jest.',
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
      '-e',
      '--env',
      '--expand',
      '-f',
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
      '-w',
      '--moduleDirectories',
      '--moduleFileExtensions',
      '--moduleNameMapper',
      '--modulePathIgnorePatterns',
      '--modulePaths',
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
      '--snapshotSerializers',
      '-t',
      '--testEnvironment',
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
      '--verbose',
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
