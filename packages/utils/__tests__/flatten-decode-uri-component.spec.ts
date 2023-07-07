import * as Utils from '@deot/helper-utils';

describe('flatten-decode-uri-component.ts', () => {
	it('basic', () => {
		let v1 = '我';
		let v2 = v1;
		Array.from({ length: 100 }).forEach(() => {
			v2 = encodeURIComponent(v2);
		});

		expect(Utils.flattenDecodeURIComponent(v2)).toBe(v1);
	});

	it('maxTries: 1000', () => {
		let v1 = '我';
		let v2 = v1;
		Array.from({ length: 1001 }).forEach(() => {
			v2 = encodeURIComponent(v2);
		});
		try {
			Utils.flattenDecodeURIComponent(v2);
		} catch (e: any) {
			expect(v2).toBe(e.message);
		}
	});

	it('error input', () => {
		expect(Utils.flattenDecodeURIComponent('%')).toBe('%');
	});

	it('error input', () => {
		expect(Utils.flattenDecodeURIComponent('%')).toBe('%');
		
		let v1 = '我%';
		let v2 = v1;
		Array.from({ length: 100 }).forEach(() => {
			v2 = encodeURIComponent(v2);
		});

		expect(Utils.flattenDecodeURIComponent(v2)).toBe(v1);
	});
});

