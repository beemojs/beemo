import { Config } from '@jest/types';

export interface CoverageThreshold {
	branches?: number;
	functions?: number;
	lines?: number;
	statements?: number;
}

export type NotifyMode =
	| 'always'
	| 'change'
	| 'failure-change'
	| 'failure'
	| 'success-change'
	| 'success';

export type CommonConfig = Partial<
	Omit<Config.InitialOptions, 'coverageThreshold' | 'notifyMode' | 'projects'>
> & {
	coverageThreshold?: Record<string, CoverageThreshold>;
	notifyMode?: NotifyMode;
};

export type ProjectConfig = Partial<Config.ProjectConfig>;

export interface JestConfig extends CommonConfig {
	projects?: (ProjectConfig | string)[];
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
	changedSince?: number | string;
	ci?: boolean;
	clearCache?: boolean;
	clearMocks?: boolean;
	collectCoverage?: boolean;
	collectCoverageFrom?: string;
	collectCoverageOnlyFrom?: string[];
	color?: boolean;
	colors?: boolean;
	config?: string;
	coverage?: boolean;
	coverageDirectory?: string;
	coveragePathIgnorePatterns?: string[];
	coverageProvider?: 'babel' | 'v8';
	coverageReporters?: string[];
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
	globals?: string;
	globalSetup?: string;
	globalTeardown?: string;
	h?: boolean;
	haste?: string;
	help?: boolean;
	i?: boolean;
	init?: boolean;
	injectGlobals?: boolean;
	json?: boolean;
	lastCommit?: boolean;
	listTests?: boolean;
	logHeapUsage?: boolean;
	mapCoverage?: boolean;
	maxConcurrency?: number;
	maxWorkers?: number;
	moduleDirectories?: string[];
	moduleFileExtensions?: string[];
	moduleNameMapper?: string;
	modulePathIgnorePatterns?: string[];
	modulePaths?: string[];
	noStackTrace?: boolean;
	notify?: boolean;
	notifyMode?: NotifyMode;
	o?: boolean;
	onlyChanged?: boolean;
	onlyFailures?: boolean;
	outputFile?: string;
	passWithNoTests?: boolean;
	preset?: string;
	prettierPath?: string;
	projects?: string[];
	reporters?: string[];
	resetMocks?: boolean;
	resetModules?: boolean;
	resolver?: string;
	restoreMocks?: boolean;
	rootDir?: string;
	roots?: string[];
	runInBand?: boolean;
	runner?: string;
	runTestsByPath?: string;
	selectProjects?: string[];
	setupFiles?: string[];
	setupFilesAfterEnv?: string[];
	showConfig?: boolean;
	silent?: boolean;
	skipFilter?: boolean;
	snapshotSerializers?: string[];
	t?: string;
	testEnvironment?: string;
	testEnvironmentOptions?: string;
	testFailureExitCode?: number | string;
	testLocationInResults?: boolean;
	testMatch?: string[];
	testNamePattern?: string;
	testPathIgnorePatterns?: string[];
	testPathPattern?: string[];
	testRegex?: string[];
	testResultsProcessor?: string;
	testRunner?: string;
	testSequencer?: string;
	testTimeout?: number;
	testURL?: string;
	timers?: string;
	transform?: string;
	transformIgnorePatterns?: string[];
	u?: boolean;
	unmockedModulePathPatterns?: string[];
	updateSnapshot?: boolean;
	useStderr?: boolean;
	v?: boolean;
	verbose?: boolean;
	version?: boolean;
	w?: number;
	watch?: boolean;
	watchAll?: boolean;
	watchman?: string;
	watchPathIgnorePatterns?: string[];
}
