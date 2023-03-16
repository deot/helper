import { Unicode } from '../src';

const utoa = (data) => {
	return btoa(unescape(encodeURIComponent(data)));
};

const atou = (b64) => {
	return decodeURIComponent(escape(atob(b64)));
};

describe('unicode.ts', () => {
	it('encode/decode', () => {
		const data = '中文';
		const INPUT = Unicode.encode(data);

		expect(Unicode.decode(INPUT)).toBe(data);
	});

	it('old encode/decode', () => {
		const data = '中文';
		const INPUT = utoa(data);

		expect(atou(INPUT)).toBe(data);
		expect(Unicode.decode(INPUT)).toBe(data);
	});

	// 字符长度大时比较
	it('gzip compare', () => {
		const data = JSON.stringify(
			Array
				.from({ length: 10000 })
				.reduce((pre: any, _, index) => {
					pre[index] = Math.random();
					return pre;
				}, {})
		);
		const INPUT1 = Unicode.encode(data);
		const INPUT2 = utoa(data);

		expect(INPUT1.length < INPUT2.length).toBe(true);
	});
});

