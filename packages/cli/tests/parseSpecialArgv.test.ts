import parseSpecialArgv from '../src/parseSpecialArgv';

describe('parseSpecialArgv()', () => {
  it('passes args through', () => {
    expect(parseSpecialArgv(['--foo', '-v', '--bar=123', 'baz'])).toEqual({
      argv: ['--foo', '-v', '--bar=123', 'baz'],
      parallelArgv: [],
    });
  });

  it('separates // into multiple commands', () => {
    expect(parseSpecialArgv(['--foo', '-v', '//', '--bar', 'bar', '//', 'baz'])).toEqual({
      argv: ['--foo', '-v'],
      parallelArgv: [['--bar', 'bar'], ['baz']],
    });
  });
});
