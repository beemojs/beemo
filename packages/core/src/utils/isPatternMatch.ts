import micromatch from 'micromatch';

export default function isPatternMatch(string: string, pattern: string): boolean {
  if (!string || !pattern) {
    return false;
  }

  // Wildcard all (*)
  if (pattern === '*') {
    return true;
  }

  // Whitelist (foo,bar)
  if (pattern.includes(',') && !pattern.includes('{')) {
    return pattern.split(',').some(part => string === part);
  }

  // Patterns ([a-z], foo|bar, etc)
  return micromatch.isMatch(string, pattern);
}
