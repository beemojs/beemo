declare module 'hygen' {
  export interface Logger {
    ok: (msg: string) => void;
    notice: (msg: string) => void;
    warn: (msg: string) => void;
    err: (msg: string) => void;
    log: (msg: string) => void;
    colorful: (msg: string) => void;
  }

  export interface Prompter {
    prompt: (params: any) => Promise<any>,
  }

  export interface RunnerConfig {
    // TODO
    createPrompter?: () => Prompter;
    cwd: string;
    debug: boolean;
    exec: (sh: string, body: string) => void;
    helpers?: object;
    logger: Logger;
    templates: string;
  }

  export type ActionResult = any;

  export function engine(argv: string[], config: RunnerConfig): Promise<ActionResult[]>;
}

declare module 'hygen/lib/logger' {
  import { Logger } from 'hygen';

  export default class BaseLogger implements Logger {
    constructor(cb: (msg: string) => void);
    ok(msg: string): void;
    notice(msg: string): void;
    warn(msg: string): void;
    err(msg: string): void;
    log(msg: string): void;
    colorful(msg: string): void;
  }
}
