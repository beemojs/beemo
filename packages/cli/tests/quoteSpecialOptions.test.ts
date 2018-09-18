import parseSpecialArgv from '../src/parseSpecialArgv';

describe('parseSpecialArgv()', () => {
  it('passes args through', () => {
    expect(parseSpecialArgv(['--foo', '-v', '--bar=123', 'baz'])).toEqual({
      main: ['--foo', '-v', '--bar=123', 'baz'],
      parallel: [],
    });
  });

  it('separates |> into multiple commands', () => {
    expect(parseSpecialArgv(['--foo', '-v', '|>', '--bar', '|>', 'baz'])).toEqual({
      main: ['--foo', '-v'],
      parallel: [['--bar'], ['baz']],
    });
  });
});
