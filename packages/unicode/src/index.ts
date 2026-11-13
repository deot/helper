import { zlibSync, unzlibSync, strToU8, strFromU8 } from 'fflate';

/**
 * https://developer.mozilla.org/zh-CN/docs/Glossary/Base64
 * a: ascii(ascii字符串), b: binary(二进制), u: unicode(统一码)
 *
 * Unicode 解码和编码
 * escape / unescape
 * ↓↓↓↓↓↓   ECMAScript 3 ↓↓↓↓↓↓
 * encodeURI / decodeURI
 * escape / decodeURI 都不会编码 ASCII 字符。
 * ↓↓↓↓↓↓ 补充转义 ↓↓↓↓↓↓
 * encodeURICompoent / decodeURICompoent
 * 转义/\?.:=| ASCII 标点字符
 *
 * 8位码: btoa('a') -> YQ==
 * 16位编码: btoa('中') -> Character Out Of Range
 * ↓↓↓↓↓↓↓↓↓↓↓↓
 * utoa: UTF-16 字符串转换为 UTF-8 字符再进行编码
 */

/**
 * Unicode编码 + 压缩
 * @param data value
 * @returns base64
 */
export const utoa = (data: string): string => {
	const buffer = strToU8(data);
	const zipped = zlibSync(buffer, { level: 9 });
	const binary = strFromU8(zipped, true);
	return btoa(binary);
};

/**
 * zlib 头（RFC 1950）: CM = 8, CINFO <= 7, 且 (CMF << 8 | FLG) 是 31 的倍数
 * 不限定压缩级别（x78 xDA 仅是 level 9），最短的 zlib 数据为 8 字节
 * @param binary binary string
 * @returns 是否可能是 zlib 数据
 */
const isZlib = (binary: string): boolean => {
	if (binary.length < 8) return false;
	const cmf = binary.charCodeAt(0);
	const flg = binary.charCodeAt(1);

	return (cmf & 0x0F) === 8 && (cmf >> 4) <= 7 && ((cmf << 8) | flg) % 31 === 0;
};

const adler32 = (data: Uint8Array): number => {
	let a = 1;
	let b = 0;
	for (let i = 0; i < data.length;) {
		const end = Math.min(i + 5552, data.length);
		for (; i < end; i++) {
			a += data[i];
			b += a;
		}
		a %= 65521;
		b %= 65521;
	}
	return ((b << 16) | a) >>> 0;
};

let decoder: TextDecoder | undefined;

const unzip = (binary: string): string => {
	const buffer = strToU8(binary, true);
	const unzipped = unzlibSync(buffer);

	// fflate 不校验尾部的 adler32，这里校验以排除“恰好能解压”的非 zlib 数据
	const n = buffer.length;
	const checksum = ((buffer[n - 4] << 24) | (buffer[n - 3] << 16) | (buffer[n - 2] << 8) | buffer[n - 1]) >>> 0;
	if (adler32(unzipped) !== checksum) {
		throw new Error('invalid zlib data: checksum mismatch');
	}

	// strFromU8 会剥离开头的 BOM，这里需要原样保留
	decoder ||= new TextDecoder('utf-8', { ignoreBOM: true });
	return decoder.decode(unzipped);
};

// old unicode hacks for backward compatibility
// https://base64.guru/developers/javascript/examples/unicode-strings
const legacy = (binary: string): string => decodeURIComponent(escape(binary));

/**
 * Unicode解码 + 解压
 * @param base64 base64
 * @returns value
 */
export const atou = (base64: string): string => {
	const binary = atob(base64);
	if (!isZlib(binary)) return legacy(binary);

	let error: unknown;
	try {
		return unzip(binary);
	} catch (e) {
		error = e;
	}

	// 未压缩的旧数据也可能以 zlib 头开始（如 `x^`、`xڀ`），解压失败时按旧格式解码
	try {
		return legacy(binary);
	} catch {
		throw error;
	}
};

export const encode = utoa;
export const decode = atou;
