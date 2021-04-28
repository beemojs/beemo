import { Driver, Execution } from '@beemo/core';
import { JestConfig } from './types';

// Success:
//  Writes passed tests to stderr (Bug? https://github.com/facebook/jest/issues/5064)
//  Writes coverage to stdout
// Failure: Writes failed tests to stderr
export class JestDriver extends Driver<JestConfig> {
  readonly name = '@beemo/driver-jest';

  bootstrap() {
    this.setMetadata({
      bin: 'jest',
      configName: 'jest.config.js',
      dependencies: [],
      description: this.tool.msg('app:jestDescription'),
      title: 'Jest',
      watchOptions: ['--watch', '--watchAll'],
    });
  }

  getDependencies(): string[] {
    const deps = super.getDependencies();

    if (this.tool.driverRegistry.isRegistered('babel') && !deps.includes('babel')) {
      deps.push('babel');
    }

    return deps;
  }

  // https://github.com/nodejs/node/issues/19218
  // istanbul ignore next
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
      '--coverageProvider',
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
      '--init',
      '--injectGlobals',
      '--json',
      '--lastCommit',
      '--listTests',
      '--logHeapUsage',
      '--mapCoverage',
      '--maxConcurrency',
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
      '--prettierPath',
      '--projects',
      '--reporters',
      '--resetMocks',
      '--resetModules',
      '--resolver',
      '--restoreMocks',
      '--rootDir',
      '--roots',
      '--runInBand',
      '--runner',
      '--runTestsByPath',
      '--selectProjects',
      '--setupFiles',
      '--setupFilesAfterEnv',
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
      '--testSequencer',
      '--testTimeout',
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

  processSuccess(response: Execution) {
    const out = response.stdout.trim();
    const err = response.stderr.trim();

    if (response.command?.includes('--coverage')) {
      this.setOutput('stdout', `${err}\n${out}`);
    } else if (err) {
      this.setOutput('stdout', err);
    }
  }
}
