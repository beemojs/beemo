export type UISetting = 'bdd' | 'tdd' | 'qunit' | 'exports';

export interface ReporterOptions {
  [key: string]: unknown;
}

export interface MochaConfig {
  allowUncaught?: boolean;
  asyncOnly?: boolean;
  bail?: boolean;
  checkLeaks?: boolean;
  color?: boolean;
  delay?: boolean;
  diff?: boolean;
  exit?: boolean;
  extension?: string | string[];
  fgrep?: string;
  file?: string | string[];
  forbidOnly?: boolean;
  forbidPending?: boolean;
  fullTrace?: boolean;
  global?: string | string[];
  grep?: string;
  growl?: boolean;
  ignore?: string | string[];
  inlineDiffs?: boolean;
  invert?: boolean;
  noExit?: boolean;
  noTimeout?: boolean;
  opts?: string;
  package?: string;
  recursive?: boolean;
  reporter?: string;
  reporterOption?: string | string[];
  require?: string | string[];
  retries?: number;
  slow?: number;
  sort?: boolean;
  spec?: string;
  timeout?: number;
  traceWarnings?: boolean;
  ui?: UISetting;
  v8StackTraceLimit?: number;
  watch?: boolean;
  watchFiles?: string | string[];
  watchIgnore?: string | string[];
  // Dashed and alias names
  [key: string]: unknown;
}

export interface MochaArgs {
  A?: boolean;
  allowUncaught?: boolean;
  asyncOnly?: boolean;
  b?: boolean;
  bail?: boolean;
  c?: boolean;
  C?: boolean;
  checkLeaks?: boolean;
  colors?: boolean;
  config?: string;
  debug?: boolean;
  debugBrk?: boolean;
  delay?: boolean;
  deprecation?: boolean;
  diff?: boolean;
  esStaging?: boolean;
  exclude?: string;
  exit?: boolean;
  exposeGc?: boolean;
  f?: string;
  fgrep?: string;
  file?: string;
  forbidOnly?: boolean;
  forbidPending?: boolean;
  fullTrace?: boolean;
  G?: boolean;
  g?: string;
  gc?: boolean; // Deprecated
  gcGlobal?: boolean;
  globals?: string;
  grep?: string;
  growl?: boolean;
  h?: boolean;
  help?: boolean;
  i?: boolean;
  icuDataDir?: boolean;
  inlineDiffs?: boolean;
  inspect?: boolean;
  inspectBrk?: boolean;
  interfaces?: boolean;
  invert?: boolean;
  logTimerEvents?: boolean;
  napiModules?: boolean;
  O?: string;
  opts?: string; // Deprecated
  package?: string;
  perfBasicProf?: boolean;
  preserveSymlinks?: boolean;
  prof?: boolean;
  r?: string;
  R?: string;
  recursive?: boolean;
  reporter?: string;
  reporterOptions?: string | string[];
  reporters?: boolean;
  require?: string;
  retries?: number;
  S?: boolean;
  s?: number;
  slow?: number;
  sort?: boolean;
  t?: number;
  throwDeprecation?: boolean;
  timeout?: number;
  timeouts?: boolean;
  trace?: boolean;
  traceDeprecation?: boolean;
  traceWarnings?: boolean;
  u?: UISetting;
  ui?: UISetting;
  useStrict?: boolean;
  V?: boolean;
  version?: boolean;
  w?: boolean;
  warnings?: boolean;
  watch?: boolean;
  watchExtensions?: string | string[];
}
