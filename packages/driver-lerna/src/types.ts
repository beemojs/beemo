export interface LernaConfig {
  command?: {
    bootstrap?: {
      ignore?: string | string[];
      npmClientArgs?: string[];
      scope?: string[];
    };
    publish?: {
      ignoreChanges?: string[];
      message?: string;
      registry?: string;
    };
  };
  npmClient?: 'npm' | 'yarn';
  packages?: string[];
  useWorkspaces?: boolean;
  version?: string;
}

// Only global options and does not include command options
export interface LernaArgs {
  concurrency?: number;
  h?: boolean;
  help?: boolean;
  loglevel?: string;
  maxBuffer?: number;
  progress?: boolean;
  rejectCycles?: boolean;
  sort?: boolean;
  v?: boolean;
  version?: boolean;
}
