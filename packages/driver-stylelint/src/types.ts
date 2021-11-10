import { Config } from 'stylelint';

export type FormatterType = 'compact' | 'json' | 'string' | 'tap' | 'unix' | 'verbose';

export interface StylelintConfig extends Partial<Config> {
	ignore?: string[];
}

export interface StylelintArgs {
	aei?: boolean;
	allowEmptyInput?: boolean;
	cache?: boolean;
	cacheLocation?: string;
	color?: boolean;
	config?: string;
	configBasedir?: string;
	customFormatter?: string;
	customSyntax?: string;
	di?: boolean;
	disableDefaultIgnores?: boolean;
	f?: FormatterType;
	fix?: boolean;
	formatter?: FormatterType;
	i?: string;
	id?: boolean;
	ignoreDisables?: boolean;
	ignorePath?: string;
	ignorePattern?: string;
	ip?: string;
	maxWarnings?: number;
	mw?: number;
	o?: string;
	outputFile?: string;
	printConfig?: boolean;
	q?: boolean;
	quiet?: boolean;
	rd?: boolean;
	rdd?: boolean;
	reportDescriptionlessDisables?: boolean;
	reportInvalidScopeDisables?: boolean;
	reportNeedlessDisables?: boolean;
	risd?: boolean;
	stdin?: boolean;
	stdinFilename?: string;
	v?: boolean;
	version?: boolean;
}
