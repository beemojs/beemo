/**
 * @copyright   2017-2019, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

export type LintSetting = 0 | 1 | 2 | 'off' | 'warn' | 'error';

export interface LintsConfig {
  [rule: string]: LintSetting;
}

export type ToggleSetting = 'never' | 'always' | 'auto';

export type OptionSetting = 'enable' | 'ignore' | 'warn';

export type MatchPattern = string | RegExp;

export interface OptionsConfig {
  all?: boolean;
  emoji?: boolean;
  'esproposal.class_instance_fields'?: OptionSetting;
  'esproposal.class_static_fields'?: OptionSetting;
  'esproposal.decorators'?: OptionSetting;
  'esproposal.export_star_as'?: OptionSetting;
  'esproposal.optional_chaining'?: OptionSetting;
  'esproposal.nullish_coalescing'?: OptionSetting;
  'experimental.const_params'?: boolean;
  include_warnings?: boolean;
  'log.file'?: string;
  max_header_tokens?: number;
  'module.file_ext'?: string[];
  'module.ignore_non_literal_requires'?: boolean;
  'module.name_mapper'?: { [regex: string]: string };
  'module.name_mapper.extension'?: { [ext: string]: string };
  'module.system'?: 'node' | 'haste';
  'module.system.node.resolve_dirname'?: string[];
  'module.use_strict'?: boolean;
  munge_underscores?: boolean;
  no_flowlib?: boolean;
  'server.max_workers'?: number;
  'sharedmemory.dirs'?: boolean;
  'sharedmemory.minimum_available'?: number;
  'sharedmemory.dep_table_pow'?: number;
  'sharedmemory.hash_table_pow'?: number;
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
  jsonVersion?: string | number;
  maxWarnings?: number;
  messageWidth?: number;
  oneLine?: boolean;
  pretty?: boolean;
  print?: string;
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
