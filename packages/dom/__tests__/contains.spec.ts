import * as $ from '@deot/helper-dom';

describe('contains.ts', () => {
	const el = document.createElement('div');
	const child = document.createElement('button');

	it('empty', () => {
		expect($.contains(el)).toBe(false);
	});

	it('basic', () => {
		el.getBoundingClientRect = () => {
			return {
				top: 0,
				bottom: 100,
				left: 0,
				right: 100
			} as DOMRect;
		};

		child.getBoundingClientRect = () => {
			return {
				top: 10,
				bottom: 20,
				left: 10,
				right: 20
			} as DOMRect;
		};
		expect($.contains(el, child)).toBe(true);
		expect($.contains(document.documentElement, child)).toBe(true);
	});
});
