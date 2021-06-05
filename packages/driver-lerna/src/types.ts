export type NPMClient = 'npm' | 'pnpm' | 'yarn';

interface GlobalOptions {
	concurrency?: number;
	h?: boolean;
	help?: boolean;
	loglevel?: string;
	maxBuffer?: number;
	progress?: boolean;
	rejectCycles?: boolean;
	sort?: boolean;
	v?: boolean;
	version?: boolean;
}

interface FilterOptions {
	excludeDependents?: boolean;
	ignore?: string[] | string;
	private?: boolean;
	since?: string;
	scope?: string;
	includeDependencies?: boolean;
	includeDependents?: boolean;
	includeMergedTags?: boolean;
}

interface InteractiveOptions {
	y?: boolean;
	yes?: boolean;
}

interface OutputOptions {
	a?: boolean;
	all?: boolean;
	graph?: boolean;
	json?: boolean;
	l?: boolean;
	long?: boolean;
	ndjson?: boolean;
	p?: boolean;
	parseable?: boolean;
	toposort?: boolean;
}

export interface LernaAddOptions extends GlobalOptions, FilterOptions {
	boostrap?: boolean;
	D?: boolean;
	dev?: boolean;
	E?: boolean;
	exact?: boolean;
	P?: boolean;
	peer?: boolean;
	registry?: string;
}

export interface LernaBootstrapOptions extends GlobalOptions, FilterOptions {
	contents?: string;
	forceLocal?: boolean;
	hoist?: string;
	ignorePrepublish?: boolean;
	ignoreScripts?: boolean;
	nohoist?: string;
	npmClient?: NPMClient;
	registry?: string;
	strict?: boolean;
	useWorkspaces?: boolean;
}

export interface LernaChangedOptions extends GlobalOptions, OutputOptions {
	conventionalGraduate?: boolean;
	forcePublish?: boolean;
	ignoreChanges?: string[];
	includeMergedTags?: boolean;
}

export interface LernaCleanOptions extends GlobalOptions, FilterOptions, InteractiveOptions {}

export interface LernaCreateOptions extends GlobalOptions, InteractiveOptions {
	access?: 'public' | 'restricted';
	bin?: string;
	description?: string;
	dependencies?: string[];
	esModule?: boolean;
	homepage?: string;
	keywords?: string[];
	license?: string;
	private?: boolean;
	registry?: string;
	tag?: string;
}

export interface LernaDiffOptions extends GlobalOptions {
	ignoreChanges?: string[];
}

export interface LernaExecOptions extends GlobalOptions, FilterOptions {
	bail?: boolean;
	parallel?: boolean;
	prefix?: boolean;
	profile?: boolean;
	profileLocation?: string;
	stream?: boolean;
}

export interface LernaImportOptions extends GlobalOptions, InteractiveOptions {
	flatten?: boolean;
	dest?: string;
	preserveCommit?: boolean;
}

export interface LernaInitOptions extends GlobalOptions {
	exact?: boolean;
	i?: boolean;
	independent?: boolean;
}

export interface LernaLinkOptions extends GlobalOptions {
	forceLocal?: boolean;
	contents?: string;
}

export interface LernaListOptions extends GlobalOptions, FilterOptions, OutputOptions {}

export interface LernaRunOptions extends LernaExecOptions {
	npmClient?: NPMClient;
}

export interface LernaVersionOptions extends GlobalOptions, InteractiveOptions {
	allowBranch?: string[] | string;
	amend?: boolean;
	changelog?: boolean;
	changelogPreset?: string;
	commitHooks?: boolean;
	conventionalCommits?: boolean;
	conventionalGraduate?: boolean;
	conventionalPrerelease?: boolean;
	createRelease?: 'github' | 'gitlab';
	exact?: boolean;
	forceGitTag?: boolean;
	forcePublish?: boolean;
	gitRemote?: string;
	gitTagVersion?: boolean;
	granularPathspec?: boolean;
	ignoreChanges?: string[];
	ignoreScripts?: boolean;
	includeMergedTags?: boolean;
	loglevel?: string;
	m?: string;
	message?: string;
	preid?: string;
	private?: boolean;
	push?: boolean;
	signGitCommit?: boolean;
	signGitTag?: boolean;
	tagVersionPrefix?: string;
}

export interface LernaPublishOptions extends LernaVersionOptions {
	c?: boolean;
	canary?: boolean;
	contents?: string;
	distTag?: string;
	gitHead?: string;
	gitReset?: boolean;
	graphType?: boolean;
	ignorePrepublish?: boolean;
	ignoreScripts?: boolean;
	legacyAuth?: string;
	otp?: string;
	preDistTag?: string;
	registry?: string;
	requireScripts?: boolean;
	tempTag?: boolean;
	verifyAccess?: boolean;
}

export interface LernaConfig {
	command?: {
		add?: LernaAddOptions;
		bootstrap?: LernaBootstrapOptions;
		changed?: LernaChangedOptions;
		clearn?: LernaCleanOptions;
		create?: LernaCreateOptions;
		diff?: LernaDiffOptions;
		exec?: LernaExecOptions;
		import?: LernaImportOptions;
		info?: GlobalOptions;
		init?: LernaInitOptions;
		link?: LernaLinkOptions;
		list?: LernaListOptions;
		publish?: LernaPublishOptions;
		run?: LernaRunOptions;
		version?: LernaVersionOptions;
	};
	npmClient?: NPMClient;
	packages?: string[];
	useWorkspaces?: boolean;
	version?: string;
}

export interface LernaArgs
	extends LernaAddOptions,
		LernaBootstrapOptions,
		LernaChangedOptions,
		LernaCleanOptions,
		LernaCreateOptions,
		LernaDiffOptions,
		LernaExecOptions,
		LernaImportOptions,
		LernaInitOptions,
		LernaLinkOptions,
		LernaListOptions,
		LernaPublishOptions,
		LernaRunOptions,
		LernaVersionOptions {}
