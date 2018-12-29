/**
 * @copyright   2017-2019, Miles Johnson
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

export interface JestArgs {
  all?: boolean;
  automock?: boolean;
  b?: boolean;
  bail?: boolean;
  browser?: boolean;
  c?: string;
  cache?: boolean;
  cacheDirectory?: string;
  changedFilesWithAncestor?: boolean;
  changedSince?: string | number;
  ci?: boolean;
  clearCache?: boolean;
  clearMocks?: boolean;
  collectCoverage?: boolean;
  collectCoverageFrom?: string;
  collectCoverageOnlyFrom?: string | string[];
  color?: boolean;
  colors?: boolean;
  config?: string;
  coverage?: boolean;
  coverageDirectory?: string;
  coveragePathIgnorePatterns?: string | string[];
  coverageReporters?: string | string[];
  coverageThreshold?: string;
  debug?: boolean;
  detectLeaks?: boolean;
  detectOpenHandles?: boolean;
  e?: boolean;
  env?: string;
  errorOnDeprecated?: boolean;
  expand?: boolean;
  f?: boolean;
  filter?: string;
  findRelatedTests?: boolean;
  forceExit?: boolean;
  globalSetup?: string;
  globalTeardown?: string;
  globals?: string;
  haste?: string;
  h?: boolean;
  help?: boolean;
  i?: boolean;
  init?: boolean;
  json?: boolean;
  lastCommit?: boolean;
  listTests?: boolean;
  logHeapUsage?: boolean;
  mapCoverage?: boolean;
  maxWorkers?: number;
  moduleDirectories?: string | string[];
  moduleFileExtensions?: string | string[];
  moduleNameMapper?: string;
  modulePathIgnorePatterns?: string | string[];
  modulePaths?: string | string[];
  watchman?: string;
  noStackTrace?: boolean;
  notify?: boolean;
  notifyMode?: string;
  o?: boolean;
  onlyChanged?: boolean;
  onlyFailures?: boolean;
  outputFile?: string;
  passWithNoTests?: boolean;
  preset?: string;
  prettierPath?: string;
  projects?: string | string[];
  reporters?: string | string[];
  resetMocks?: boolean;
  resetModules?: boolean;
  resolver?: string;
  restoreMocks?: boolean;
  rootDir?: string;
  roots?: string | string[];
  runInBand?: boolean;
  runner?: string;
  runTestsByPath?: string;
  setupFiles?: string | string[];
  setupFilesAfterEnv?: string | string[];
  showConfig?: boolean;
  silent?: boolean;
  skipFilter?: boolean;
  snapshotSerializers?: string | string[];
  t?: string;
  testEnvironment?: string;
  testEnvironmentOptions?: string;
  testFailureExitCode?: string | number;
  testLocationInResults?: boolean;
  testMatch?: string | string[];
  testNamePattern?: string;
  testPathIgnorePatterns?: string | string[];
  testPathPattern?: string | string[];
  testRegex?: string | string[];
  testResultsProcessor?: string;
  testRunner?: string;
  testURL?: string;
  timers?: string;
  transform?: string;
  transformIgnorePatterns?: string | string[];
  u?: boolean;
  unmockedModulePathPatterns?: string | string[];
  updateSnapshot?: boolean;
  useStderr?: boolean;
  v?: boolean;
  verbose?: boolean;
  version?: boolean;
  w?: number;
  watch?: boolean;
  watchAll?: boolean;
  watchPathIgnorePatterns?: string | string[];
}
