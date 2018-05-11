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
  if (pattern.includes(',')) {
    return !!string.match(new RegExp(pattern.replace(/,/g, '|')));
  }

  // Patterns ([a-z], foo|bar, etc)
  return micromatch.isMatch(string, pattern);
}
