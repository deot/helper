import * as Utils from '@deot/helper-utils';

describe('canvas-to-image.ts', () => {
	const canvas = document.createElement('canvas');

	Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
		value: () => {
			return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';
		}
	});

	it('basic', async () => {
		const result = await Utils.canvasToImage(canvas);
		expect(result.file).toBe(undefined);
		expect(typeof result.dataURL).toBe('string');
	});

	it('file', async () => {
		const filename = 'example.png';
		const result = await Utils.canvasToImage(canvas, filename);

		expect(result.file!.name).toBe(filename);
		expect(typeof result.dataURL).toBe('string');
	});
});
