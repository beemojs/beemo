export type LintSetting = 'error' | 'off' | 'warn' | 0 | 1 | 2;

export interface LintsConfig {
  [rule: string]: LintSetting;
}

export type ToggleSetting = 'always' | 'auto' | 'never';

export type OptionSetting = 'enable' | 'ignore' | 'warn';

export type MatchPattern = RegExp | string;

export type LazyMode = 'fs' | 'ide' | 'none' | 'watchman';

export type ModuleSystem = 'haste' | 'node';

export type MismatchType = 'choose-newest' | 'error-client' | 'restart-client' | 'stop-server';

export interface OptionsConfig {
  all?: boolean;
  emoji?: boolean;
  'esproposal.class_instance_fields'?: OptionSetting;
  'esproposal.class_static_fields'?: OptionSetting;
  'esproposal.decorators'?: OptionSetting;
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
  'module.name_mapper'?: { [regex: string]: string };
  'module.name_mapper.extension'?: { [ext: string]: string };
  'module.system'?: ModuleSystem;
  'module.system.node.main_field'?: string;
  'module.system.node.resolve_dirname'?: string[];
  'module.use_strict'?: boolean;
  munge_underscores?: boolean;
  no_flowlib?: boolean;
  'server.max_workers'?: number;
  'sharedmemory.dirs'?: string;
  'sharedmemory.minimum_available'?: number;
  'sharedmemory.dep_table_pow'?: number;
  'sharedmemory.hash_table_pow'?: number;
  'sharedmemory.heap_size'?: number;
  'sharedmemory.log_level'?: number;
  strip_root?: boolean;
  suppress_comment?: MatchPattern;
  suppress_type?: string;
  temp_dir?: string;
  traces?: number;
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
  sharedmemoryDepTablePow?: number;
  sharedmemoryDirs?: string;
  sharedmemoryHashTablePow?: number;
  sharedmemoryLogLevel?: 0 | 1;
  sharedmemoryMinimumAvailable?: number;
  showAllBranches?: boolean;
  showAllErrors?: boolean;
  stripRoot?: boolean;
  tempDir?: string;
  timeout?: number;
  unicode?: ToggleSetting;
  version?: boolean;
}
