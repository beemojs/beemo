import micromatch from 'micromatch';

export default function isPatternMatch(
  string: string,
  pattern: string,
  options?: micromatch.Options,
): boolean {
  if (!string || !pattern) {
    return false;
  }

  // Wildcard all (*)
  if (pattern === '*') {
    return true;
  }

  // Whitelist (foo,bar)
  if (pattern.includes(',') && !pattern.includes('{')) {
    return pattern.split(',').includes(string);
  }

  // Patterns ([a-z], foo|bar, etc)
  return micromatch.isMatch(string, pattern, options);
}
