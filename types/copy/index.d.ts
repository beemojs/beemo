declare module 'copy' {
  // vinyl
  interface File {
    path: string;
  }

  interface Callback {
    (error: Error | null, files: File[]): void;
  }

  interface Options {
    cwd?: string;
    srcBase?: string;
  }

  export default function copy(
    patterns: string | string[] | object,
    dir: string,
    options?: Options | Callback,
    callback?: Callback,
  ): void;
}
