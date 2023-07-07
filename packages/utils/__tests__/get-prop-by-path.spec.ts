import * as Utils from '@deot/helper-utils';

describe('get-prop-by-path.ts', () => {
	let target = { a: { b: { c: 1 } } };

	it('basic', () => {
		let result = Utils.getPropByPath(target, 'a.b.c');

		expect(result.v).toBe(1);
		expect(result.k).toBe('c');
		expect(result.o).toEqual({ c: 1 });
	});

	it('error', () => {
		let target1 = { a: { b: { c: {} } } };
		try {
			Utils.getPropByPath(target1, 'a.b.c.d.f');
		} catch (e: any) {
			expect(e.message).toMatch('无效路径');
		}
	});
});

