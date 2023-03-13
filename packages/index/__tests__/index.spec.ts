import * as Utils from '../src';

describe('index.ts', () => {
	it('any', () => {
		expect(Utils.helper({ value: '' })).toBe('');
	});
});
