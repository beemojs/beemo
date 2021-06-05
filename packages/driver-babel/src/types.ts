import { MatchPattern, PluginItem, TransformOptions } from '@babel/core';

export type { MatchPattern, PluginItem };

export type SourceMaps = NonNullable<TransformOptions['sourceMaps']>;

export type SourceType = NonNullable<TransformOptions['sourceType']>;

export type RootMode = NonNullable<TransformOptions['rootMode']>;

export type BabelConfig = TransformOptions;

export interface BabelArgs {
	auxiliaryCommentAfter?: string;
	auxiliaryCommentBefore?: string;
	babelrc?: boolean;
	comments?: boolean;
	compact?: boolean | 'auto';
	configFile?: string;
	copyFiles?: boolean;
	copyIgnored?: boolean;
	d?: string;
	D?: boolean;
	deleteDirOnStart?: boolean;
	envName?: string;
	extensions?: string;
	f?: string;
	filename?: string;
	h?: boolean;
	help?: boolean;
	highlightCode?: boolean;
	ignore?: string[];
	includeDotfiles?: boolean;
	keepFileExtension?: boolean;
	M?: boolean;
	minified?: boolean;
	moduleId?: string;
	moduleIds?: boolean;
	moduleRoot?: string;
	o?: string;
	only?: string[];
	outDir?: string;
	outFile?: string;
	outFileExtension?: string;
	plugins?: string[];
	presets?: string[];
	quiet?: boolean;
	relative?: boolean;
	retainLines?: boolean;
	rootMode?: RootMode;
	s?: SourceMaps;
	skipInitialBuild?: boolean;
	sourceFileName?: string;
	sourceMaps?: SourceMaps;
	sourceMapTarget?: string;
	sourceRoot?: string;
	sourceType?: SourceType;
	V?: boolean;
	verbose?: boolean;
	version?: boolean;
	w?: boolean;
	watch?: boolean;
	x?: string;
}
