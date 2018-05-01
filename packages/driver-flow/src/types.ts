/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable camelcase */

export type LintSetting = 0 | 1 | 2 | 'off' | 'warn' | 'error';

export interface LintsConfig {
  [rule: string]: LintSetting;
}

export type OptionSetting = 'enable' | 'ignore' | 'warn';

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
  suppress_comment?: string | RegExp;
  suppress_type?: string;
  temp_dir?: string;
  traces?: number;
  'unsafe.enable_getters_and_setters'?: boolean;
}

export interface FlowConfig {
  include?: string[];
  ignore?: string[];
  libs?: string[];
  lints?: LintsConfig;
  options?: OptionsConfig;
  version?: string;
}
