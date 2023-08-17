import * as Utils from '@deot/helper-utils';

describe('flatten.ts', () => {
	it('basic', () => {
		let v1 = '我';
		let v2 = v1;
		Array.from({ length: 100 }).forEach(() => {
			v2 = encodeURIComponent(v2);
		});

		expect(Utils.flatten(v2)).toBe(v1);
	});

	it('maxTries: 1000', () => {
		let v1 = '我';
		let v2 = v1;
		Array.from({ length: 1001 }).forEach(() => {
			v2 = encodeURIComponent(v2);
		});
		try {
			Utils.flatten(v2);
		} catch (e: any) {
			expect(v2).toBe(e.message);
		}
	});

	it('error input', () => {
		expect(Utils.flatten('%')).toBe('%');
	});

	it('error input', () => {
		expect(Utils.flatten('%')).toBe('%');
		
		let v1 = '我%';
		let v2 = v1;
		Array.from({ length: 100 }).forEach(() => {
			v2 = encodeURIComponent(v2);
		});

		expect(Utils.flatten(v2)).toBe(v1);
	});
});

