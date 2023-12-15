import * as Utils from '@deot/helper-utils';

describe('flatten-json-parse.ts', () => {
	it('basic', () => {
		expect(Utils.flattenJSONParse(null)).toBe(null);
		expect(Utils.flattenJSONParse('1')).toBe(1);
		expect(Utils.flattenJSONParse('{}')).toEqual({});
		expect(Utils.flattenJSONParse('9007199254740992')).toEqual('9007199254740992');
		expect(Utils.flattenJSONParse('9007199254740991')).toEqual(9007199254740991);
	});

	it('maxTries: 10', () => {
		const v1 = {};
		let v2 = JSON.stringify(v1);
		Array.from({ length: 11 }).forEach(() => {
			v2 = JSON.stringify(v2);
		});
		try {
			Utils.flattenJSONParse(v2);
		} catch (e: any) {
			expect(v2).toBe(e.message);
		}
	});
});
