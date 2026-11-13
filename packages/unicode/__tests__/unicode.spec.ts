import * as Unicode from '@deot/helper-unicode';
import { zlibSync, strToU8, strFromU8 } from 'fflate';

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

	it('empty', () => {
		expect(Unicode.decode(Unicode.encode(''))).toBe('');
		expect(Unicode.decode('')).toBe('');
	});

	it('emoji', () => {
		const data = '👨‍👩‍👧 𝒳 中文 abc';

		expect(Unicode.decode(Unicode.encode(data))).toBe(data);
		expect(Unicode.decode(utoa(data))).toBe(data);
	});

	// 超过 fflate 分块(16384)与 adler32 分块(5552)的长度
	it('large', () => {
		const data = 'a中😀'.repeat(50000);

		expect(Unicode.decode(Unicode.encode(data))).toBe(data);
	});

	// 开头的 BOM 属于数据本身，不应被剥离
	it('bom', () => {
		['\uFEFF', '\uFEFFabc', '\uFEFF\uFEFF中文', 'a\uFEFFb'].forEach((data) => {
			expect(Unicode.decode(Unicode.encode(data))).toBe(data);
			expect(Unicode.decode(utoa(data))).toBe(data);
		});
	});

	// 孤立的代理项无法用 UTF-8 表示，按 TextEncoder 的行为替换为 U+FFFD
	it('lone surrogate', () => {
		expect(Unicode.decode(Unicode.encode('a\uD800b'))).toBe('a\uFFFDb');
		expect(Unicode.decode(Unicode.encode('a\uDC00'))).toBe('a\uFFFD');
	});

	// 未压缩的旧数据恰好以 zlib 头开始时，仍按旧格式解码
	it('old data starts with zlib header', () => {
		expect(Unicode.decode(utoa('x\u0680 hello'))).toBe('x\u0680 hello'); // x78 xDA
		expect(Unicode.decode(utoa('x^abcdefgh'))).toBe('x^abcdefgh'); // x78 x5E

		// CMF 的全部取值 × 前两个字节的全部组合
		const failed: string[] = [];
		for (let cmf = 0x08; cmf <= 0x78; cmf += 0x10) {
			for (let code = 0; code <= 0x7FF; code++) {
				const data = String.fromCharCode(cmf, code) + ' tail 尾部';
				if (Unicode.decode(utoa(data)) !== data) {
					failed.push(data);
				}
			}
		}

		expect(failed).toEqual([]);
	});

	// 其他压缩级别的 zlib 头: x78 x01 / x78 x5E / x78 x9C / x78 xDA
	it('zlib levels', () => {
		const data = '中文 abc '.repeat(20);
		const headers = ([0, 1, 6, 9] as const).map((level) => {
			const binary = strFromU8(zlibSync(strToU8(data), { level }), true);

			expect(Unicode.decode(btoa(binary))).toBe(data);
			return binary.charCodeAt(1);
		});

		expect(headers).toEqual([0x01, 0x5E, 0x9C, 0xDA]);
	});

	it('corrupted zlib data', () => {
		const INPUT = Unicode.encode('hello world 中文');
		const binary = atob(INPUT);
		const tampered = binary.slice(0, -1) + String.fromCharCode(binary.charCodeAt(binary.length - 1) ^ 0xFF);

		expect(() => Unicode.decode(INPUT.slice(0, 12))).toThrow('unexpected EOF');
		expect(() => Unicode.decode(btoa(tampered))).toThrow('checksum mismatch');
	});

	it('invalid input', () => {
		expect(() => Unicode.decode('!!!')).toThrow();
		expect(() => Unicode.decode(btoa('\xFF\xFE'))).toThrow(URIError);
	});
});
