export const STRATEGY_COPY = 'copy';
export const STRATEGY_CREATE = 'create';
export const STRATEGY_REFERENCE = 'reference';
export const STRATEGY_NATIVE = 'native';
export const STRATEGY_NONE = 'none';
export const STRATEGY_TEMPLATE = 'template';

export const KEBAB_PATTERN = /^[a-z]{1}[a-z-]+[a-z]{1}$/u;

// Keep in sync with CLI options
export const EXECUTE_OPTIONS = {
  '--concurrency': true,
  '--graph': true,
  '--stdio': true,
  '--workspaces': true,
};
