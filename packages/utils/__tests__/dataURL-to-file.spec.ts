import * as Utils from '@deot/helper-utils';

describe('dataURL-to-file.ts', () => {
	const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';
	const noSuffixBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';

	it('basic', () => {
		const result = Utils.dataURLToFile(base64);
		expect(result.name).toBe('__filename');
	});

	it('filetype', () => {
		const filename = 'example.doc';
		const result = Utils.dataURLToFile(noSuffixBase64, filename, 'applition/document');
		expect(result.name).toBe(filename);
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
	});
});
