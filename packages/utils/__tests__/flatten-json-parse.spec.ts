import * as Utils from '@deot/helper-utils';

describe('flatten-json-parse.ts', () => {
	it('basic', () => {
		expect(Utils.flattenJSONParse(null)).toBe(null);
		expect(Utils.flattenJSONParse('1')).toBe(1);
		expect(Utils.flattenJSONParse('{}')).toEqual({});
		expect(Utils.flattenJSONParse('9007199254740992')).toEqual('9007199254740992');
		expect(Utils.flattenJSONParse('9007199254740991')).toEqual(9007199254740991);
		expect(Utils.flattenJSONParse('1E1')).toEqual('1E1');
		expect(Utils.flattenJSONParse(`["1234"]`)).toEqual(['1234']);
		expect(Utils.flattenJSONParse(`["1234"]`)).toEqual(['1234']);
		expect(Utils.flattenJSONParse(`-1`)).toEqual(-1);
		expect(Utils.flattenJSONParse(`-1E1`)).toEqual('-1E1');
	});

	it('超出安全范围的负整数', () => {
		expect(Utils.flattenJSONParse('-9007199254740991')).toBe(-9007199254740991);
		expect(Utils.flattenJSONParse('-9007199254740992')).toBe('-9007199254740992');
		expect(Utils.flattenJSONParse('-9007199254740993')).toBe('-9007199254740993');
	});

	it('嵌套字符串内的大数与科学计数', () => {
		expect(Utils.flattenJSONParse('"1"')).toBe(1);
		expect(Utils.flattenJSONParse('"9007199254740991"')).toBe(9007199254740991);
		expect(Utils.flattenJSONParse('"9007199254740993"')).toBe('9007199254740993');
		expect(Utils.flattenJSONParse('"-9007199254740993"')).toBe('-9007199254740993');
		expect(Utils.flattenJSONParse(JSON.stringify('"9007199254740993"'))).toBe('9007199254740993');
		expect(Utils.flattenJSONParse('"1E1"')).toBe('1E1');
	});

	it('无法解析时原样返回', () => {
		expect(Utils.flattenJSONParse('not-json')).toBe('not-json');
		expect(Utils.flattenJSONParse('0123')).toBe('0123');
	});

	it('多层嵌套', () => {
		const v1 = { a: 1 };
		let v2 = JSON.stringify(v1);
		Array.from({ length: 11 }).forEach(() => {
			v2 = JSON.stringify(v2);
		});

		expect(Utils.flattenJSONParse(v2)).toEqual(v1);
	});
});
