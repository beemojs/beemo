import path from 'path';

export const EXEC_RESULT = {
  cmd: '',
  code: 0,
  failed: false,
  killed: false,
  signal: null,
  stderr: '',
  stdout: '',
  timedOut: false,
};

export function prependRoot(part: string): string {
  return path.join(__dirname, part);
}

export function getRoot(): string {
  return __dirname;
}

export function getFixturePath(part: string): string {
  return path.join(__dirname, 'fixtures', part);
}
