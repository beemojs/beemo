/* eslint-disable camelcase */

export type LintSetting = 'error' | 'off' | 'warn' | 0 | 1 | 2;

export type LintsConfig = Record<string, LintSetting>;

export type ToggleSetting = 'always' | 'auto' | 'never';

export type OptionSetting = 'enable' | 'ignore' | 'warn';

export type MatchPattern = RegExp | string;

export type LazyMode = 'fs' | 'ide' | 'none' | 'watchman';

export type ModuleSystem = 'haste' | 'node';

export type MismatchType = 'choose-newest' | 'error-client' | 'restart-client' | 'stop-server';

export type ReactRuntime = 'automatic' | 'classic';

export interface OptionsConfig {
  all?: boolean;
  babel_loose_array_spread?: boolean;
  emoji?: boolean;
  'esproposal.class_instance_fields'?: OptionSetting;
  'esproposal.class_static_fields'?: OptionSetting;
  'esproposal.decorators'?: Exclude<OptionSetting, 'enable'>;
  'esproposal.export_star_as'?: OptionSetting;
  'esproposal.optional_chaining'?: OptionSetting;
  'esproposal.nullish_coalescing'?: OptionSetting;
  exact_by_default?: boolean;
  'experimental.const_params'?: boolean;
  include_warnings?: boolean;
  lazy_mode?: LazyMode;
  'log.file'?: string;
  max_header_tokens?: number;
  'module.file_ext'?: string[];
  'module.ignore_non_literal_requires'?: boolean;
  'module.name_mapper'?: Record<string, string>;
  'module.name_mapper.extension'?: Record<string, string>;
  'module.system'?: ModuleSystem;
  'module.system.node.main_field'?: string[] | string;
  'module.system.node.resolve_dirname'?: string[] | string;
  'module.use_strict'?: boolean;
  munge_underscores?: boolean;
  no_flowlib?: boolean;
  'react.runtime'?: ReactRuntime;
  'server.max_workers'?: number;
  'sharedmemory.dep_table_pow'?: number;
  'sharedmemory.dirs'?: string[] | string;
  'sharedmemory.hash_table_pow'?: number;
  'sharedmemory.heap_size'?: number;
  'sharedmemory.log_level'?: number;
  'sharedmemory.minimum_available'?: number;
  strip_root?: boolean;
  suppress_comment?: MatchPattern | MatchPattern[];
  suppress_type?: string[] | string;
  temp_dir?: string;
  traces?: number;
  types_first?: boolean;
  well_formed_exports?: boolean;
  'well_formed_exports.includes'?: string[];
}

export interface FlowConfig {
  declarations?: string[];
  include?: string[];
  ignore?: string[];
  libs?: string[];
  lints?: LintsConfig;
  options?: OptionsConfig;
  untyped?: string[];
  version?: string;
}

export interface FlowArgs {
  autoStart?: boolean;
  color?: ToggleSetting;
  flowconfigName?: string;
  from?: string;
  help?: boolean;
  ignoreVersion?: boolean;
  includeWarnings?: boolean;
  json?: boolean;
  jsonVersion?: number;
  lazy?: boolean;
  lazyMode?: LazyMode;
  maxWarnings?: number;
  messageWidth?: number;
  offsetStyle?: 'js-indices' | 'utf8-bytes';
  oneLine?: boolean;
  onMismatch?: MismatchType;
  pretty?: boolean;
  quiet?: boolean;
  retries?: number;
  retryIfInit?: boolean;
  sharedmemoryHashTablePow?: number;
  sharedmemoryHeapSize?: number;
  sharedmemoryLogLevel?: 0 | 1;
  showAllBranches?: boolean;
  showAllErrors?: boolean;
  stripRoot?: boolean;
  tempDir?: string;
  timeout?: number;
  unicode?: ToggleSetting;
  version?: boolean;
}
