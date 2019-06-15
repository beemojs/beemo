interface ExecLike {
  cmd?: string;
  stderr?: string;
  stdout?: string;
}

export default function formatExecReturn<T extends ExecLike>(
  obj: T,
): Pick<T, Exclude<keyof T, 'cmd' | 'stderr' | 'stdout'>> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Remove stdio for easier logging output
  const { cmd, stderr, stdout, ...rest } = obj;

  return rest;
}
