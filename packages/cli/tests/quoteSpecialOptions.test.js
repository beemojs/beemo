import quoteSpecialOptions from '../src/quoteSpecialOptions';

describe('quoteSpecialOptions()', () => {
  it('passes args through', () => {
    expect(quoteSpecialOptions(['--foo', '-v', '--bar=123', 'baz'])).toEqual([
      '--foo',
      '-v',
      '--bar=123',
      'baz',
    ]);
  });

  it('quotes --parallel args', () => {
    expect(quoteSpecialOptions(['--foo', '-v', '--parallel=--bar', 'baz'])).toEqual([
      '--foo',
      '-v',
      '--parallel="--bar"',
      'baz',
    ]);
  });

  it('skips --parallel with no values', () => {
    expect(quoteSpecialOptions(['--foo', '-v', '--parallel', 'baz'])).toEqual([
      '--foo',
      '-v',
      'baz',
    ]);
  });
});
