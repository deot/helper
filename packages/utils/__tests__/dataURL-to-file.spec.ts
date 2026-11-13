import * as Utils from '@deot/helper-utils';

describe('dataURL-to-file.ts', () => {
	const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';
	const noSuffixBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';

	it('basic', () => {
		const result = Utils.dataURLToFile(base64);
		expect(result.name).toBe('__filename');
		expect(result.type).toBe('image/png');
		expect(result.size).toBe(70);
	});

	it('filetype', () => {
		const filename = 'example.doc';
		const result = Utils.dataURLToFile(noSuffixBase64, filename, 'applition/document');
		expect(result.name).toBe(filename);
		expect(result.type).toBe('applition/document');
	});

	it('autofix ext', () => {
		const filename = 'example.jpeg';
		const result = Utils.dataURLToFile(noSuffixBase64, filename);
		expect(result.name).toBe(filename);
	});

	it('autofix image/jpeg', () => {
		const filename = 'example';
		const result = Utils.dataURLToFile(noSuffixBase64, filename);
		expect(result.name).toBe(filename);
		expect(result.type).toBe('image/jpeg');
	});

	it('扩展名推断 MIME', () => {
		expect(Utils.dataURLToFile(noSuffixBase64, 'example.jpeg').type).toBe('image/jpeg');
		expect(Utils.dataURLToFile(noSuffixBase64, 'example.jpg').type).toBe('image/jpeg');
		expect(Utils.dataURLToFile(noSuffixBase64, 'example.JPG').type).toBe('image/jpeg');
		expect(Utils.dataURLToFile(noSuffixBase64, 'example.png').type).toBe('image/png');
		expect(Utils.dataURLToFile(noSuffixBase64, 'example.svg').type).toBe('image/svg+xml');
	});

	it('Data URL 自带的 MIME 优先', () => {
		const result = Utils.dataURLToFile(base64, 'example.jpg', 'image/webp');
		expect(result.type).toBe('image/png');
	});

	it('带额外参数的 base64', async () => {
		const result = Utils.dataURLToFile('data:text/plain;charset=utf-8;base64,aGVsbG8=', 'a.txt');
		expect(result.type).toBe('text/plain');
		expect(await result.text()).toBe('hello');
	});

	it('省略 MIME 的 base64', async () => {
		const result = Utils.dataURLToFile('data:;base64,aGVsbG8=', 'a.png');
		expect(result.type).toBe('image/png');
		expect(await result.text()).toBe('hello');
	});

	it('非 base64 的 Data URL', async () => {
		const plain = Utils.dataURLToFile('data:text/plain,hello%20world', 'a.txt');
		expect(plain.type).toBe('text/plain');
		expect(await plain.text()).toBe('hello world');

		const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>我,100%</text></svg>';
		const encoded = Utils.dataURLToFile(`data:image/svg+xml,${encodeURIComponent(svg)}`, 'a.svg');
		expect(encoded.type).toBe('image/svg+xml');
		expect(await encoded.text()).toBe(svg);

		// 含非法 % 时按原文处理
		const raw = Utils.dataURLToFile(`data:image/svg+xml;charset=utf-8,${svg}`, 'a.svg');
		expect(raw.type).toBe('image/svg+xml');
		expect(await raw.text()).toBe(svg);
	});
});
