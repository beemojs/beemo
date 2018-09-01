/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

export interface CoverageThreshold {
  branches?: number;
  functions?: number;
  lines?: number;
  statements?: number;
}

export type ReporterConfig = [string, { [option: string]: any }];

export interface CommonConfig {
  automock?: boolean;
  bail?: boolean;
  browser?: boolean;
  cache?: boolean;
  cacheDirectory?: string;
  clearMocks?: boolean;
  collectCoverage?: boolean;
  collectCoverageFrom?: string[];
  coverageDirectory?: string;
  coveragePathIgnorePatterns?: string[];
  coverageReporters?: ('json' | 'lcov' | 'text')[];
  coverageThreshold?: { [key: string]: CoverageThreshold };
  cwd?: string;
  detectLeaks?: boolean;
  errorOnDeprecated?: boolean;
  forceCoverageMatch?: string[];
  globals?: { [global: string]: boolean };
  globalSetup?: string;
  globalTeardown?: string;
  moduleDirectories?: string[];
  moduleFileExtensions?: string[];
  moduleLoader?: string;
  moduleNameMapper?: { [key: string]: string };
  modulePathIgnorePatterns?: string[];
  modulePaths?: string[];
  notify?: string;
  notifyMode?: 'always' | 'failure' | 'success' | 'change' | 'success-change' | 'failure-success';
  preset?: string;
  prettierPath?: string;
  reporters?: (string | ReporterConfig)[];
  resetMocks?: boolean;
  resetModules?: boolean;
  resolver?: string;
  restoreMocks?: boolean;
  rootDir?: string;
  roots?: string[];
  runner?: string;
  setupFiles?: string[];
  setupTestFrameworkScriptFile?: string;
  snapshotSerializers?: string[];
  testEnvironment?: string;
  testEnvironmentOptions?: object;
  testMatch?: string[];
  testPathIgnorePatterns?: string[];
  testRegex?: string;
  testResultsProcessor?: string;
  testRunner?: string;
  testURL?: string;
  timers?: 'real' | 'fake';
  transform?: { [key: string]: string };
  transformIgnorePatterns?: string[];
  unmockedModulePathPatterns?: string[];
  verbose?: boolean;
  watchPathIgnorePatterns?: string[];
}

export interface ProjectConfig extends CommonConfig {
  displayName: string;
}

export interface JestConfig extends CommonConfig {
  projects?: (string | ProjectConfig)[];
}
