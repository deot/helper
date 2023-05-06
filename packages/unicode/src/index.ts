import { zlibSync, unzlibSync, strToU8, strFromU8 } from 'fflate';

/**
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
 */

/**
 * Unicode编码 + 压缩
 * @param {[string]} data value
 * @returns {[string]} base64
 */
export const utoa = (data: string): string => {
	const buffer = strToU8(data);
	const zipped = zlibSync(buffer, { level: 9 });
	const binary = strFromU8(zipped, true);
	return btoa(binary);
};

/**
 * Unicode解码 + 解压
 * @param {[string]} base64 base64
 * @returns {[string]} value
 */
export const atou = (base64: string): string => {
	const binary = atob(base64);

	// zlib header (x78), level 9 (xDA)
	if (binary.startsWith('\x78\xDA')) {
		const buffer = strToU8(binary, true);
		const unzipped = unzlibSync(buffer);
		return strFromU8(unzipped);
	}

	// old unicode hacks for backward compatibility
	// https://base64.guru/developers/javascript/examples/unicode-strings
	return decodeURIComponent(escape(binary));
};

export const encode = utoa;
export const decode = atou;