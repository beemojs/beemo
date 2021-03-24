export const STRATEGY_NONE = 'none';

export const STRATEGY_COPY = 'copy';
export const STRATEGY_CREATE = 'create';
export const STRATEGY_REFERENCE = 'reference';
export const STRATEGY_NATIVE = 'native';
export const STRATEGY_TEMPLATE = 'template';

export const STRATEGY_BUFFER = 'buffer';
export const STRATEGY_PIPE = 'pipe';
export const STRATEGY_STREAM = 'stream';

export const KEBAB_PATTERN = /^[a-z]{1}[a-z-]+[a-z]{1}$/u;

// Keep in sync with CLI options
export const EXECUTE_OPTIONS = {
	'--concurrency': true,
	'--graph': true,
	'--workspaces': true,
};
