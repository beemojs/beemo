export type UISetting = 'bdd' | 'exports' | 'qunit' | 'tdd';

export type ReporterSetting =
	| 'doc'
	| 'dot'
	| 'json-stream'
	| 'json'
	| 'landing'
	| 'list'
	| 'markdown'
	| 'min'
	| 'nyan'
	| 'progress'
	| 'spec'
	| 'tap'
	| 'xunit';

export interface MochaConfig {
	// Dashed and alias names
	[key: string]: unknown;
	A?: boolean;
	allowUncaught?: boolean;
	asyncOnly?: boolean;
	b?: boolean;
	bail?: boolean;
	c?: boolean;
	checkLeaks?: boolean;
	color?: boolean;
	colors?: boolean;
	config?: string;
	delay?: boolean;
	diff?: boolean;
	exclude?: string[] | string;
	exit?: boolean;
	extension?: string[] | string;
	f?: string;
	fgrep?: string;
	file?: string[] | string;
	forbidOnly?: boolean;
	forbidPending?: boolean;
	fullTrace?: boolean;
	g?: string;
	G?: boolean;
	global?: string[] | string;
	globals?: string[] | string;
	grep?: string;
	growl?: boolean;
	h?: boolean;
	help?: boolean;
	i?: boolean;
	ignore?: string[] | string;
	inlineDiffs?: boolean;
	invert?: boolean;
	j?: number;
	jobs?: number;
	listInterfaces?: boolean;
	listReporters?: boolean;
	O?: string[];
	p?: boolean;
	package?: string;
	parallel?: boolean;
	r?: string[];
	R?: ReporterSetting;
	recursive?: boolean;
	reporter?: ReporterSetting;
	reporterOption?: string[] | string;
	reporterOptions?: string[] | string;
	require?: string[] | string;
	retries?: number;
	s?: number | string;
	S?: boolean;
	slow?: number | string;
	sort?: boolean;
	t?: number | string;
	timeout?: number | string;
	timeouts?: number | string;
	u?: UISetting;
	ui?: UISetting;
	V?: boolean;
	version?: boolean;
	w?: boolean;
	watch?: boolean;
	watchFiles?: string[] | string;
	watchIgnore?: string[] | string;
}

export interface MochaArgs {
	A?: boolean;
	allowUncaught?: boolean;
	asyncOnly?: boolean;
	b?: boolean;
	bail?: boolean;
	c?: boolean;
	checkLeaks?: boolean;
	color?: boolean;
	colors?: boolean;
	config?: string;
	delay?: boolean;
	diff?: boolean;
	exclude?: string[];
	exit?: boolean;
	extension?: string[];
	f?: string;
	fgrep?: string;
	file?: string[];
	forbidOnly?: boolean;
	forbidPending?: boolean;
	fullTrace?: boolean;
	g?: string;
	G?: boolean;
	global?: string[];
	globals?: string[];
	grep?: string;
	growl?: boolean;
	h?: boolean;
	help?: boolean;
	i?: boolean;
	ignore?: string[];
	inlineDiffs?: boolean;
	invert?: boolean;
	j?: number;
	jobs?: number;
	listInterfaces?: boolean;
	listReporters?: boolean;
	O?: string[];
	p?: boolean;
	package?: string;
	parallel?: boolean;
	r?: string[];
	R?: ReporterSetting;
	recursive?: boolean;
	reporter?: ReporterSetting;
	reporterOption?: string[];
	reporterOptions?: string[];
	require?: string[];
	retries?: number;
	s?: number | string;
	S?: boolean;
	slow?: number | string;
	sort?: boolean;
	t?: number | string;
	timeout?: number | string;
	timeouts?: number | string;
	u?: UISetting;
	ui?: UISetting;
	V?: boolean;
	version?: boolean;
	w?: boolean;
	watch?: boolean;
	watchFiles?: string[];
	watchIgnore?: string[];
}
