import { isPatternMatch } from '../../src/helpers/isPatternMatch';

describe('isPatternMatch()', () => {
	it('returns false for empty value', () => {
		expect(isPatternMatch('', '*')).toBe(false);
	});

	it('returns true for wildcard', () => {
		expect(isPatternMatch('foo', '*')).toBe(true);
		expect(isPatternMatch('123', '*')).toBe(true);
	});

	it('handles lists of values', () => {
		expect(isPatternMatch('foo', 'foo,bar')).toBe(true);
		expect(isPatternMatch('bar', 'foo,bar')).toBe(true);
		expect(isPatternMatch('baz', 'foo,bar')).toBe(false);
	});

	it('handles bracket ranges', () => {
		expect(isPatternMatch('foo', 'b[a-z]+')).toBe(false);
		expect(isPatternMatch('bar', 'b[a-z]+')).toBe(true);
		expect(isPatternMatch('baz', 'b[a-z]+')).toBe(true);
	});

	it('handles braces', () => {
		expect(isPatternMatch('foo', 'b{oo,az}')).toBe(false);
		expect(isPatternMatch('bar', 'b{oo,az}')).toBe(false);
		expect(isPatternMatch('baz', 'b{oo,az}')).toBe(true);
	});

	it('handles OR parens', () => {
		expect(isPatternMatch('foo', 'b(oo|az)')).toBe(false);
		expect(isPatternMatch('bar', 'b(oo|az)')).toBe(false);
		expect(isPatternMatch('baz', 'b(oo|az)')).toBe(true);
	});
});
